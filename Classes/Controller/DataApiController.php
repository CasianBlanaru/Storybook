<?php
declare(strict_types=1);

namespace MyVendor\MyFluidStorybook\Controller;

use Psr\Http\Message\ResponseInterface;
use TYPO3\CMS\Core\Context\Context;
use TYPO3\CMS\Core\Core\Environment;
use TYPO3\CMS\Core\Database\ConnectionPool;
use TYPO3\CMS\Core\Http\JsonResponse;
use TYPO3\CMS\Core\Log\LogManager;
use TYPO3\CMS\Core\Utility\GeneralUtility;

/**
 * API Controller for fetching single database records.
 *
 * This controller provides an endpoint to fetch specific records from allowed
 * TYPO3 database tables. It is intended for use in Development context only
 * to supply Storybook stories with realistic data.
 */
class DataApiController
{
    /**
     * @var list<string> A list of table names that are allowed to be queried via this API.
     */
    private const ALLOWED_TABLES = ['tt_content', 'pages', 'sys_file_reference'];

    /**
     * @var ConnectionPool Used to get database connections.
     */
    protected ConnectionPool $connectionPool;

    /**
     * @var Context The current TYPO3 application context.
     */
    protected Context $context;

    /**
     * Constructor.
     * Injects ConnectionPool and Context.
     *
     * @param ConnectionPool $connectionPool
     * @param Context $context
     */
    public function __construct(ConnectionPool $connectionPool, Context $context)
    {
        $this->connectionPool = $connectionPool;
        $this->context = $context;
    }

    /**
     * Fetches a single record from the specified table by its UID.
     *
     * Access is restricted to Development context and an allowlist of tables.
     *
     * @param string $tableName The name of the database table.
     * @param int $uid The UID of the record to fetch.
     * @return ResponseInterface JSON response with the record data or an error message.
     */
    public function getRecordAction(string $tableName, int $uid): ResponseInterface
    {
        if (!Environment::getContext()->isDevelopment()) {
            return new JsonResponse(['error' => 'This API is only available in Development context.'], 403);
        }

        if (!in_array($tableName, self::ALLOWED_TABLES, true)) {
            GeneralUtility::makeInstance(LogManager::class)
                ->getLogger(__CLASS__)
                ->warning('Attempt to access not allowed table.', ['table' => $tableName]);
            return new JsonResponse(['error' => 'Table not allowed: ' . htmlspecialchars($tableName)], 400);
        }
        if ($uid <= 0) {
            return new JsonResponse(['error' => 'Invalid UID.'], 400);
        }

        try {
            $queryBuilder = $this->connectionPool->getQueryBuilderForTable($tableName);
            // Note: Default context for QueryBuilder in a stateless request might be limited.
            // It might not automatically apply all frontend restrictions (e.g., enable fields)
            // unless the Context is fully configured for frontend rendering.
            // For Storybook data fetching, this direct access is often what's needed initially.
            // Consider using $this->context->setAspect(...) if specific frontend visibility rules are essential.

            $record = $queryBuilder
                ->select('*')
                ->from($tableName)
                ->where($queryBuilder->expr()->eq('uid', $queryBuilder->createNamedParameter($uid, \PDO::PARAM_INT)))
                // Basic enable field check for common tables, assuming 'deleted' and 'hidden' fields.
                // This is a simplified version; a full TCA-aware visibility check is more complex.
                // ->andWhere($queryBuilder->expr()->eq('hidden', $queryBuilder->createNamedParameter(0, \PDO::PARAM_INT)))
                // ->andWhere($queryBuilder->expr()->eq('deleted', $queryBuilder->createNamedParameter(0, \PDO::PARAM_INT)))
                ->executeQuery()
                ->fetchAssociative();

            if ($record === false) {
                return new JsonResponse(['error' => 'Record not found.', 'table' => $tableName, 'uid' => $uid], 404);
            }

            return new JsonResponse(['record' => $record]);

        } catch (\Exception $e) {
            GeneralUtility::makeInstance(LogManager::class)
                ->getLogger(__CLASS__)
                ->error('Database query failed: ' . $e->getMessage(), ['table' => $tableName, 'uid' => $uid, 'exception' => $e]);
            return new JsonResponse(['error' => 'Failed to fetch record due to a server error.'], 500);
        }
    }
}

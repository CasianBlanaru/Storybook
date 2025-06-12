<?php
declare(strict_types=1);

namespace MyVendor\MyFluidStorybook\Controller;

use Psr\Http\Message\ResponseInterface;
use TYPO3\CMS\Core\Context\Context;
use TYPO3\CMS\Core\Core\Environment;
use TYPO3\CMS\Core\Database\ConnectionPool;
use TYPO3\CMS\Core\Http\JsonResponse;
use TYPO3\CMS\Core\Utility\GeneralUtility;

class DataApiController // Not extending ActionController to keep it minimal & PSR-15 like for future.
{
    private const ALLOWED_TABLES = ['tt_content', 'pages', 'sys_file_reference'];

    protected ConnectionPool $connectionPool;
    protected Context $context;

    public function __construct(ConnectionPool $connectionPool, Context $context)
    {
        $this->connectionPool = $connectionPool;
        $this->context = $context;
    }

    public function getRecordAction(string $tableName, int $uid): ResponseInterface
    {
        if (!Environment::getContext()->isDevelopment()) {
            return new JsonResponse(['error' => 'This API is only available in Development context.'], 403);
        }

        if (!in_array($tableName, self::ALLOWED_TABLES, true)) {
            return new JsonResponse(['error' => 'Table not allowed: ' . $tableName], 400);
        }
        if ($uid <= 0) {
            return new JsonResponse(['error' => 'Invalid UID.'], 400);
        }

        $queryBuilder = $this->connectionPool->getQueryBuilderForTable($tableName);
        // TYPO3's QueryBuilder automatically handles enablefields (like deleted, hidden, starttime, endtime)
        // based on the current context (BE or FE). Here, it's more of a direct query.
        // For simplicity, we are not adding versioning/workspace handling here.
        // We might need to explicitly set context aspects if default is not suitable.
        // $this->context->getPropertyFromAspect('visibility', 'includeHiddenPages'); // Example

        $record = $queryBuilder
            ->select('*')
            ->from($tableName)
            ->where($queryBuilder->expr()->eq('uid', $queryBuilder->createNamedParameter($uid, \PDO::PARAM_INT)))
            ->executeQuery()
            ->fetchAssociative();

        if ($record === false) {
            return new JsonResponse(['error' => 'Record not found.', 'table' => $tableName, 'uid' => $uid], 404);
        }

        // Potentially fetch related records like sys_file_reference if needed,
        // but keep it simple for this basic implementation.

        return new JsonResponse(['record' => $record]);
    }
}

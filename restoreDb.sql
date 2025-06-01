USE master;
GO

ALTER DATABASE MyRestoredDB SET SINGLE_USER WITH ROLLBACK IMMEDIATE;
GO

RESTORE DATABASE MyRestoredDB
FROM DISK = 'C:\Program Files\Microsoft SQL Server\MSSQL12.ZEIN\MSSQL\Backup\ProjectTest.bak'
WITH REPLACE,
MOVE 'ProjectTest' TO 'C:\Program Files\Microsoft SQL Server\MSSQL12.ZEIN\MSSQL\DATA\MyRestoredDB.mdf',
MOVE 'ProjectTest_log' TO 'C:\Program Files\Microsoft SQL Server\MSSQL12.ZEIN\MSSQL\DATA\MyRestoredDB_log.ldf';
GO

ALTER DATABASE MyRestoredDB SET MULTI_USER;
GO




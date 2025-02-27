CREATE TABLE [dbo].[Password]
(
	[PasswordId] INT NOT NULL IDENTITY(1,1) PRIMARY KEY, 
    [PasswordGroupId] INT FOREIGN KEY REFERENCES [PasswordGroup](Id) NOT NULL,
    [PasswordGuid] UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID(), 
    [PasswordName] VARCHAR(MAX) NOT NULL, 
    [EncryptedPassword] VARCHAR(MAX) NOT NULL, 
    [Username] VARCHAR(MAX) NOT NULL,
    [CreatedAt] DATETIME DEFAULT (getdate()) NULL,
    [ModifiedAt] DATETIME DEFAULT (getdate()) NULL,
    [Notes] VARCHAR(MAX) NULL
)

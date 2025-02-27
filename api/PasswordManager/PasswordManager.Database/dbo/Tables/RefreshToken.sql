CREATE TABLE [dbo].[RefreshToken]
(
	[RefreshTokenId] INT NOT NULL PRIMARY KEY IDENTITY(1,1), 
    [RefreshTokenGuid] UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID(),
    [UserId] INT NOT NULL FOREIGN KEY REFERENCES [User](Id), 
    [RefreshTokenValue] NVARCHAR(MAX) NOT NULL, 
    [RefreshTokenExpiry] DATETIME NOT NULL, 
    [CreatedAt] DATETIME NOT NULL DEFAULT (getdate()), 
    [ModifiedAt] DATETIME NOT NULL DEFAULT (getdate())
)

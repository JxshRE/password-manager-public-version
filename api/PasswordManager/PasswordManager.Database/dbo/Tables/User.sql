CREATE TABLE [dbo].[User] (
    [Id]           INT              NOT NULL IDENTITY(1,1),
    [UserGuid]     UNIQUEIDENTIFIER DEFAULT (newid()) NOT NULL,
    [Email]        NVARCHAR (50)    NOT NULL,
    [PasswordHash] NVARCHAR (MAX)   NOT NULL,
    [CreatedAt]    DATETIME         DEFAULT (getdate()) NULL,
    [ModifiedAt]   DATETIME         DEFAULT (getdate()) NULL,
    [TwoStepKey] [varchar](max) NULL,
    [HasCompletedTwoStep] [bit] DEFAULT(0) NOT NULL,
    PRIMARY KEY CLUSTERED ([Id] ASC)
);


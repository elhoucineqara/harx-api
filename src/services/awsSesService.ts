const AWS = require('aws-sdk');

const verifyCredentials = async (accessKeyId, secretAccessKey, region) => {
    try {
        const ses = new AWS.SES({
            accessKeyId,
            secretAccessKey,
            region
        });

        const [accountResponse, quotaResponse] = await Promise.all([
            ses.getAccountSendingEnabled().promise(),
            ses.getSendQuota().promise()
        ]);

        return {
            isValid: true,
            accountInfo: {
                accountId: accountResponse.AccountId,
                sendingQuota: {
                    max24HourSend: quotaResponse.Max24HourSend,
                    maxSendRate: quotaResponse.MaxSendRate,
                    sentLast24Hours: quotaResponse.SentLast24Hours
                },
                verifiedIdentities: await listVerifiedIdentities(ses),
                settings: {
                    sendingEnabled: accountResponse.AccountSendingEnabled
                }
            },
            userInfo: {
                accountName: 'AWS Account',
                accountType: 'AWS SES',
                status: 'active',
                lastUsed: new Date()
            }
        };
    } catch (error) {
        return {
            isValid: false,
            error: error.message
        };
    }
};

const listVerifiedIdentities = async (ses) => {
    try {
        const response = await ses.listIdentities().promise();
        return response.Identities;
    } catch (error) {
        throw new Error(`Failed to list verified identities: ${error.message}`);
    }
};

const sendEmail = async (accessKeyId, secretAccessKey, region, emailData) => {
    try {
        const ses = new AWS.SES({
            accessKeyId,
            secretAccessKey,
            region
        });

        const params = {
            Source: emailData.from,
            Destination: {
                ToAddresses: emailData.to,
                CcAddresses: emailData.cc || [],
                BccAddresses: emailData.bcc || []
            },
            Message: {
                Subject: {
                    Data: emailData.subject,
                    Charset: 'UTF-8'
                },
                Body: {
                    Text: {
                        Data: emailData.text,
                        Charset: 'UTF-8'
                    },
                    Html: emailData.html ? {
                        Data: emailData.html,
                        Charset: 'UTF-8'
                    } : undefined
                }
            }
        };

        const response = await ses.sendEmail(params).promise();
        return response;
    } catch (error) {
        throw new Error(`Failed to send email via AWS SES: ${error.message}`);
    }
};

const sendTemplatedEmail = async (accessKeyId, secretAccessKey, region, templateData) => {
    try {
        const ses = new AWS.SES({
            accessKeyId,
            secretAccessKey,
            region
        });

        const params = {
            Source: templateData.from,
            Destination: {
                ToAddresses: templateData.to,
                CcAddresses: templateData.cc || [],
                BccAddresses: templateData.bcc || []
            },
            Template: templateData.templateName,
            TemplateData: JSON.stringify(templateData.templateData)
        };

        const response = await ses.sendTemplatedEmail(params).promise();
        return response;
    } catch (error) {
        throw new Error(`Failed to send templated email via AWS SES: ${error.message}`);
    }
};

const getSendStatistics = async (accessKeyId, secretAccessKey, region) => {
    try {
        const ses = new AWS.SES({
            accessKeyId,
            secretAccessKey,
            region
        });

        const response = await ses.getSendStatistics().promise();
        return response.SendDataPoints;
    } catch (error) {
        throw new Error(`Failed to get send statistics: ${error.message}`);
    }
};

const verifyEmailIdentity = async (accessKeyId, secretAccessKey, region, email) => {
    try {
        const ses = new AWS.SES({
            accessKeyId,
            secretAccessKey,
            region
        });

        const params = {
            EmailAddress: email
        };

        const response = await ses.verifyEmailIdentity(params).promise();
        return response;
    } catch (error) {
        throw new Error(`Failed to verify email identity: ${error.message}`);
    }
};

const verifyDomainIdentity = async (accessKeyId, secretAccessKey, region, domain) => {
    try {
        const ses = new AWS.SES({
            accessKeyId,
            secretAccessKey,
            region
        });

        const params = {
            Domain: domain
        };

        const response = await ses.verifyDomainIdentity(params).promise();
        return response;
    } catch (error) {
        throw new Error(`Failed to verify domain identity: ${error.message}`);
    }
};

export default { 
    verifyCredentials,
    sendEmail,
    sendTemplatedEmail,
    getSendStatistics,
    verifyEmailIdentity,
    verifyDomainIdentity
 }; 
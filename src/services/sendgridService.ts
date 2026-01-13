const sgMail = require('@sendgrid/mail');
const sgClient = require('@sendgrid/client');

const verifyCredentials = async (apiKey) => {
    try {
        sgClient.setApiKey(apiKey);
        sgMail.setApiKey(apiKey);

        const [userResponse, statsResponse] = await Promise.all([
            sgClient.request({
                url: '/v3/user',
                method: 'GET'
            }),
            sgClient.request({
                url: '/v3/stats',
                method: 'GET'
            })
        ]);

        return {
            isValid: true,
            accountInfo: {
                accountId: userResponse.body.id,
                planType: userResponse.body.type,
                monthlyQuota: userResponse.body.plan_quota,
                monthlyUsage: statsResponse.body[0].requests,
                verifiedSenders: await listVerifiedSenders(apiKey),
                settings: {
                    username: userResponse.body.username,
                    email: userResponse.body.email
                }
            },
            userInfo: {
                accountName: userResponse.body.username,
                email: userResponse.body.email,
                firstName: userResponse.body.first_name,
                lastName: userResponse.body.last_name,
                role: userResponse.body.type,
                status: userResponse.body.status
            }
        };
    } catch (error) {
        return {
            isValid: false,
            error: error.message
        };
    }
};

const listVerifiedSenders = async (apiKey) => {
    try {
        sgClient.setApiKey(apiKey);
        const response = await sgClient.request({
            url: '/v3/verified_senders',
            method: 'GET'
        });
        return response.body.results;
    } catch (error) {
        throw new Error(`Failed to list verified senders: ${error.message}`);
    }
};

const sendEmail = async (apiKey, emailData) => {
    try {
        sgMail.setApiKey(apiKey);
        const response = await sgMail.send({
            to: emailData.to,
            from: emailData.from,
            subject: emailData.subject,
            text: emailData.text,
            html: emailData.html,
            cc: emailData.cc,
            bcc: emailData.bcc,
            attachments: emailData.attachments,
            templateId: emailData.templateId,
            dynamicTemplateData: emailData.templateData
        });
        return response;
    } catch (error) {
        throw new Error(`Failed to send email via SendGrid: ${error.message}`);
    }
};

const createTemplate = async (apiKey, templateData) => {
    try {
        sgClient.setApiKey(apiKey);
        const response = await sgClient.request({
            url: '/v3/templates',
            method: 'POST',
            body: templateData
        });
        return response.body;
    } catch (error) {
        throw new Error(`Failed to create SendGrid template: ${error.message}`);
    }
};

const getTemplate = async (apiKey, templateId) => {
    try {
        sgClient.setApiKey(apiKey);
        const response = await sgClient.request({
            url: `/v3/templates/${templateId}`,
            method: 'GET'
        });
        return response.body;
    } catch (error) {
        throw new Error(`Failed to get SendGrid template: ${error.message}`);
    }
};

const listTemplates = async (apiKey) => {
    try {
        sgClient.setApiKey(apiKey);
        const response = await sgClient.request({
            url: '/v3/templates',
            method: 'GET'
        });
        return response.body.templates;
    } catch (error) {
        throw new Error(`Failed to list SendGrid templates: ${error.message}`);
    }
};

const getEmailStats = async (apiKey, filters = {}) => {
    try {
        sgClient.setApiKey(apiKey);
        const response = await sgClient.request({
            url: '/v3/stats',
            method: 'GET',
            qs: filters
        });
        return response.body;
    } catch (error) {
        throw new Error(`Failed to get SendGrid email stats: ${error.message}`);
    }
};

const verifySender = async (apiKey, senderData) => {
    try {
        sgClient.setApiKey(apiKey);
        const response = await sgClient.request({
            url: '/v3/verified_senders',
            method: 'POST',
            body: senderData
        });
        return response.body;
    } catch (error) {
        throw new Error(`Failed to verify SendGrid sender: ${error.message}`);
    }
};

export { 
    verifyCredentials,
    sendEmail,
    createTemplate,
    getTemplate,
    listTemplates,
    getEmailStats,
    verifySender
 }; 
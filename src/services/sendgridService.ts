import sgMail from '@sendgrid/mail';
import sgClient from '@sendgrid/client';

const verifyCredentials = async (apiKey: string) => {
    try {
        sgClient.setApiKey(apiKey);
        sgMail.setApiKey(apiKey);

        const [[userResponse], [statsResponse]] = await Promise.all([
            sgClient.request({
                url: '/v3/user',
                method: 'GET'
            }),
            sgClient.request({
                url: '/v3/stats',
                method: 'GET'
            })
        ]);

        const userBody = userResponse.body as any;
        const statsBody = statsResponse.body as any;

        return {
            isValid: true,
            accountInfo: {
                accountId: userBody.id,
                planType: userBody.type,
                monthlyQuota: userBody.plan_quota,
                monthlyUsage: statsBody[0]?.requests || 0,
                verifiedSenders: await listVerifiedSenders(apiKey),
                settings: {
                    username: userBody.username,
                    email: userBody.email
                }
            },
            userInfo: {
                accountName: userBody.username,
                email: userBody.email,
                firstName: userBody.first_name,
                lastName: userBody.last_name,
                role: userBody.type,
                status: userBody.status
            }
        };
    } catch (error) {
        return {
            isValid: false,
            error: error.message
        };
    }
};

const listVerifiedSenders = async (apiKey: string) => {
    try {
        sgClient.setApiKey(apiKey);
        const [response] = await sgClient.request({
            url: '/v3/verified_senders',
            method: 'GET'
        });
        return (response.body as any).results;
    } catch (error) {
        throw new Error(`Failed to list verified senders: ${error.message}`);
    }
};

const sendEmail = async (apiKey: string, emailData: { to: any; from: any; subject: any; text: any; html: any; cc: any; bcc: any; attachments: any; templateId: any; templateData: any; }) => {
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

const createTemplate = async (apiKey: string, templateData: any) => {
    try {
        sgClient.setApiKey(apiKey);
        const [response] = await sgClient.request({
            url: '/v3/templates',
            method: 'POST',
            body: templateData
        });
        return response.body;
    } catch (error) {
        throw new Error(`Failed to create SendGrid template: ${error.message}`);
    }
};

const getTemplate = async (apiKey: string, templateId: any) => {
    try {
        sgClient.setApiKey(apiKey);
        const [response] = await sgClient.request({
            url: `/v3/templates/${templateId}`,
            method: 'GET'
        });
        return response.body;
    } catch (error) {
        throw new Error(`Failed to get SendGrid template: ${error.message}`);
    }
};

const listTemplates = async (apiKey: string) => {
    try {
        sgClient.setApiKey(apiKey);
        const [response] = await sgClient.request({
            url: '/v3/templates',
            method: 'GET'
        });
        return (response.body as any).templates;
    } catch (error) {
        throw new Error(`Failed to list SendGrid templates: ${error.message}`);
    }
};

const getEmailStats = async (apiKey: string, filters = {}) => {
    try {
        sgClient.setApiKey(apiKey);
        const [response] = await sgClient.request({
            url: '/v3/stats',
            method: 'GET',
            qs: filters
        });
        return response.body;
    } catch (error) {
        throw new Error(`Failed to get SendGrid email stats: ${error.message}`);
    }
};

const verifySender = async (apiKey: string, senderData: any) => {
    try {
        sgClient.setApiKey(apiKey);
        const [response] = await sgClient.request({
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
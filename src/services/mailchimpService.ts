import mailchimp from '@mailchimp/mailchimp_marketing';

const verifyCredentials = async (apiKey: string, serverPrefix?: string) => {
    try {
        // Extract server prefix from API key if not provided (format: key-serverPrefix)
        const server = serverPrefix || apiKey.split('-').pop() || 'us1';
        
        mailchimp.setConfig({
            apiKey,
            server
        });

        const [accountResponse, listsResponse] = await Promise.all([
            mailchimp.ping.get(),
            mailchimp.lists.getAllLists()
        ]);

        return {
            isValid: true,
            accountInfo: {
                accountId: accountResponse.account_id,
                planType: accountResponse.plan_type,
                monthlyQuota: accountResponse.plan_quota,
                monthlyUsage: accountResponse.plan_usage,
                lists: listsResponse.lists.map(list => ({
                    id: list.id,
                    name: list.name,
                    memberCount: list.stats.member_count,
                    dateCreated: list.date_created
                })),
                settings: {
                    accountName: accountResponse.account_name,
                    contact: accountResponse.contact,
                    role: accountResponse.role
                }
            },
            userInfo: {
                accountName: accountResponse.account_name,
                email: accountResponse.contact.email,
                role: accountResponse.role,
                status: accountResponse.status,
                lastLogin: accountResponse.last_login
            }
        };
    } catch (error) {
        return {
            isValid: false,
            error: error.message
        };
    }
};

const sendEmail = async (apiKey: string, emailData: any, serverPrefix?: string) => {
    try {
        // Extract server prefix from API key if not provided (format: key-serverPrefix)
        const server = serverPrefix || apiKey.split('-').pop() || 'us1';
        
        mailchimp.setConfig({
            apiKey,
            server
        });

        const response = await mailchimp.messages.send({
            message: {
                subject: emailData.subject,
                from_email: emailData.from,
                to: emailData.to.map(email => ({ email })),
                cc: emailData.cc?.map(email => ({ email })),
                bcc: emailData.bcc?.map(email => ({ email })),
                text: emailData.text,
                html: emailData.html,
                attachments: emailData.attachments,
                template_name: emailData.templateName,
                template_content: emailData.templateContent,
                merge_vars: emailData.mergeVars
            }
        });

        return response;
    } catch (error) {
        throw new Error(`Failed to send email via Mailchimp: ${error.message}`);
    }
};

const createList = async (apiKey: string, listData: any, serverPrefix?: string) => {
    try {
        // Extract server prefix from API key if not provided (format: key-serverPrefix)
        const server = serverPrefix || apiKey.split('-').pop() || 'us1';
        
        mailchimp.setConfig({
            apiKey,
            server
        });

        const response = await mailchimp.lists.createList({
            name: listData.name,
            contact: listData.contact,
            permission_reminder: listData.permissionReminder,
            email_type_option: listData.emailTypeOption,
            campaign_defaults: listData.campaignDefaults
        });

        return response;
    } catch (error) {
        throw new Error(`Failed to create Mailchimp list: ${error.message}`);
    }
};

const getList = async (apiKey: string, listId: string, serverPrefix?: string) => {
    try {
        // Extract server prefix from API key if not provided (format: key-serverPrefix)
        const server = serverPrefix || apiKey.split('-').pop() || 'us1';
        
        mailchimp.setConfig({
            apiKey,
            server
        });

        const response = await mailchimp.lists.getList(listId);
        return response;
    } catch (error) {
        throw new Error(`Failed to get Mailchimp list: ${error.message}`);
    }
};

const listMembers = async (apiKey: string, listId: string, options: any = {}, serverPrefix?: string) => {
    try {
        // Extract server prefix from API key if not provided (format: key-serverPrefix)
        const server = serverPrefix || apiKey.split('-').pop() || 'us1';
        
        mailchimp.setConfig({
            apiKey,
            server
        });

        const response = await mailchimp.lists.getListMembersInfo(listId, options);
        return response;
    } catch (error) {
        throw new Error(`Failed to list Mailchimp members: ${error.message}`);
    }
};

const addMember = async (apiKey: string, listId: string, memberData: any, serverPrefix?: string) => {
    try {
        // Extract server prefix from API key if not provided (format: key-serverPrefix)
        const server = serverPrefix || apiKey.split('-').pop() || 'us1';
        
        mailchimp.setConfig({
            apiKey,
            server
        });

        const response = await mailchimp.lists.addListMember(listId, {
            email_address: memberData.email,
            status: memberData.status || 'subscribed',
            merge_fields: memberData.mergeFields,
            tags: memberData.tags
        });

        return response;
    } catch (error) {
        throw new Error(`Failed to add Mailchimp member: ${error.message}`);
    }
};

const createCampaign = async (apiKey: string, campaignData: any, serverPrefix?: string) => {
    try {
        // Extract server prefix from API key if not provided (format: key-serverPrefix)
        const server = serverPrefix || apiKey.split('-').pop() || 'us1';
        
        mailchimp.setConfig({
            apiKey,
            server
        });

        const response = await mailchimp.campaigns.create({
            type: campaignData.type,
            recipients: campaignData.recipients,
            settings: campaignData.settings,
            tracking: campaignData.tracking,
            content_type: campaignData.contentType,
            content: campaignData.content
        });

        return response;
    } catch (error) {
        throw new Error(`Failed to create Mailchimp campaign: ${error.message}`);
    }
};

const sendCampaign = async (apiKey: string, campaignId: string, serverPrefix?: string) => {
    try {
        // Extract server prefix from API key if not provided (format: key-serverPrefix)
        const server = serverPrefix || apiKey.split('-').pop() || 'us1';
        
        mailchimp.setConfig({
            apiKey,
            server
        });

        const response = await mailchimp.campaigns.send(campaignId);
        return response;
    } catch (error) {
        throw new Error(`Failed to send Mailchimp campaign: ${error.message}`);
    }
};

export default { 
    verifyCredentials,
    sendEmail,
    sendTemplatedEmail: sendEmail, // Alias for templated emails
    getSendStatistics: async (apiKey: string) => ({ sent: 0, bounces: 0, opens: 0, clicks: 0 }), // Placeholder
    createList,
    getList,
    getLists: async (apiKey: string) => ({ lists: [] }), // Placeholder - needs implementation
    listMembers,
    getListMembers: listMembers, // Alias
    addMember,
    addMemberToList: addMember, // Alias
    createCampaign,
    sendCampaign
 }; 
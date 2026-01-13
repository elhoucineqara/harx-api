import express from 'express';

export async function GET(req: express.Request, res: express.Response) {
  // Mock data for now
  return res.json({
    data: [
      { _id: '1', name: 'Salesforce', description: 'CRM software', category: 'professional' },
      { _id: '2', name: 'Zendesk', description: 'Customer service software', category: 'professional' },
      { _id: '3', name: 'Jira', description: 'Help desk software', category: 'professional' },
    ]
  });
}


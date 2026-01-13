import express from 'express';

export async function GET(req: express.Request, res: express.Response) {
  // Mock data for now
  return res.json({
    data: [
      { _id: '1', name: 'React', description: 'JavaScript library', category: 'technical' },
      { _id: '2', name: 'Node.js', description: 'JavaScript runtime', category: 'technical' },
      { _id: '3', name: 'Python', description: 'Programming language', category: 'technical' },
    ]
  });
}


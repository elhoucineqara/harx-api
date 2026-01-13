import express from 'express';
import {
  sendEnrollmentInvitation,
  acceptEnrollment,
  rejectEnrollment,
  getAgentEnrollments,
  getGigEnrollments,
  resendEnrollmentInvitation,
  cancelEnrollmentInvitation,
  requestEnrollment,
  acceptEnrollmentRequest,
  getAgentEnrolledGigs
} from '../controllers/EnrollmentController';

const router = express.Router();

// Invitation management
router.post('/invite', sendEnrollmentInvitation);
router.post('/accept', acceptEnrollment);
router.post('/reject', rejectEnrollment);
router.post('/invite/resend/:id', resendEnrollmentInvitation);
router.post('/invite/cancel/:id', cancelEnrollmentInvitation);

// Enrollment requests
router.post('/request', requestEnrollment);
router.post('/request/accept', acceptEnrollmentRequest);

// Query enrollments
router.get('/agent/:agentId', getAgentEnrollments);
router.get('/gig/:gigId', getGigEnrollments);
router.get('/agent/:agentId/enrolled', getAgentEnrolledGigs);

export default router;

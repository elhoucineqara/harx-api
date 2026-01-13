import { BaseRepository } from './BaseRepository';
import CallRecording, { ICallRecording } from '../models/CallRecording';

class CallRecordingRepository extends BaseRepository<ICallRecording> {
  constructor() {
    super(CallRecording);
  }
}

export default new CallRecordingRepository();

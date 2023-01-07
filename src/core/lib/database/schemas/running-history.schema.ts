import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true, collection: 'running_histories' })
export class RunningHistory extends Document {
  @Prop({ index: true })
  userId: number;

  @Prop()
  distanceTraveled: number;

  @Prop()
  traveledTime: number;

  @Prop()
  traveledSpeed: number;

  @Prop()
  rewarded: number;
}

export const RunningHistorySchema = SchemaFactory.createForClass(RunningHistory);

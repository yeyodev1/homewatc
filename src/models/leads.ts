import { ILead } from '../interfaces/lead.interface'
import { Schema, model } from 'mongoose'

const leadSchema: Schema<ILead> = new Schema<ILead>(
  {
    name: {
      type: String,
      required: true,
      default: null
    },
    phone: {
      type: String,
      required: true,
      default: null
    },
    propertyOfInterest: {
      type: String,
      required: true,
      default: null
    },
    propertyId: {
      type: String,
      required: true,
      default: null
    },
    message: {
      type: String,
      required: true,
      default: null
    },
    source: {
      type: String,
      required: true,
      default: null
    },
    email: {
      type: String,
      default: null
    },
    contacted: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
)

const LeadModel = model<ILead>('Lead', leadSchema)

export default LeadModel

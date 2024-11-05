import { Document } from 'mongoose'

export interface ILead extends Document {
  name: string
  phone: string
  propertyOfInterest: string
  propertyId: string
  message: string
  source: string
  email: string
  contacted: boolean
}

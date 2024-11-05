export interface Reservation {
  id_property: number
  id_reservation: number
  cod_reservation: string
  date_reservation: string
  cod_reservation_status: string
  label: string
  arrival: string
  departure: string
  email: string
  phone: string
  lang: string
  cod_channel: string
  currency: string
  charge_total_amount: number
  accommodation_total_amount: number
  payment_total_amount: number
  cleaning_fee_amount: number
  other_extra_total_amount: number
  city_tax_amount: number
  last_update: string
  internal_note: string
  lead_source: string
  tag: string
  rooms: any // Cambia 'any' por el tipo adecuado si lo conoces
}

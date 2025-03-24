import {
  pgTable,
  serial,
  varchar,
  boolean,
  integer,
  timestamp,
  real
} from 'drizzle-orm/pg-core'

export const beaches = pgTable('beaches', {
  id: serial('id').primaryKey(),
  slug: varchar('slug', { length: 255 }).notNull(),
  coverUrl: varchar('cover_url', { length: 255 }).notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  island: varchar('island', { length: 255 }).notNull(),
  municipality: varchar('municipality', { length: 255 }).notNull(),
  province: varchar('province', { length: 255 }).notNull(),
  accessByCar: boolean('access_by_car').notNull(),
  accessByFoot: varchar('access_by_foot', { length: 255 }),
  accessByShip: boolean('access_by_ship').notNull(),
  adaptedShower: boolean('adapted_shower').notNull(),
  annualMaxOccupancy: varchar('annual_max_occupancy', {
    length: 255
  }).notNull(),
  assistedBathing: boolean('assisted_bathing').notNull(),
  bathingConditions: varchar('bathing_conditions', { length: 255 }).notNull(),
  classification: varchar('classification', { length: 255 }).notNull(),
  environmentCondition: varchar('environment_condition', {
    length: 255
  }).notNull(),
  blueFlag: boolean('blue_flag').notNull(),
  hasAdaptedShowers: boolean('has_adapted_showers').notNull(),
  hasCobbles: boolean('has_cobbles').notNull(),
  hasConcrete: boolean('has_concrete').notNull(),
  hasFootShowers: boolean('has_foot_showers').notNull(),
  hasGravel: boolean('has_gravel').notNull(),
  hasMixedComposition: boolean('has_mixed_composition').notNull(),
  hasPebbles: boolean('has_pebbles').notNull(),
  hasRock: boolean('has_rock').notNull(),
  hasSand: boolean('has_sand').notNull(),
  hasShowers: boolean('has_showers').notNull(),
  hasToilets: boolean('has_toilets').notNull(),
  isBeach: boolean('is_beach').notNull(),
  isWindy: boolean('is_windy').notNull(),
  isZbm: boolean('is_zbm').notNull(),
  kidsArea: boolean('kids_area').notNull(),
  lastUpdate: timestamp('last_update').defaultNow().notNull(),
  latitude: real('latitude').notNull(),
  longitude: real('longitude').notNull(),
  length: integer('length').notNull(),
  width: integer('width').notNull(),
  lifeguardService: varchar('lifeguard_service', { length: 255 }).notNull(),
  pmrShade: boolean('pmr_shade').notNull(),
  protectionLevel: varchar('protection_level', { length: 255 }).notNull(),
  riskLevel: varchar('risk_level', { length: 255 }).notNull(),
  sandColor: varchar('sand_color', { length: 255 }).notNull(),
  sportsArea: boolean('sports_area').notNull(),
  sunbedRentals: boolean('sunbed_rentals').notNull(),
  umbrellaRentals: boolean('umbrella_rentals').notNull(),
  waterSportsRentals: boolean('water_sports_rentals').notNull(),
  wheelchairAccess: boolean('wheelchair_access').notNull()
})

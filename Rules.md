# ================================
# PROJECT RULES — Study Buddy Finder
# ================================

## Project Name
Study Buddy Finder

## Description
Web application for students to find study partners,
chat with other students, create study groups,
match by courses, schedule availability,
and allow admins to manage the system.

Frontend: React + Tailwind CSS
Backend: Supabase
Hosting: Vercel
Version control: GitHub

Use functional components only.
Use clean architecture.
Use reusable components.
Use TypeScript if possible.

IMPORTANT:
Coding style must be beginner-friendly.
Do not use advanced shortcuts.
Write simple and easy to understand code.
Use clear variable names.
Use simple English names.
Do not use complex patterns.
Do not use overly clever solutions.

Code should look like written by a student,
not by an expert engineer.

---------------------------------

# ================================
# UI DESIGN RULES
# ================================

Use Tailwind CSS only.

Design style:
Modern
Clean
Simple
Minimal

Colors:

Primary: blue
Secondary: gray
Background: light gray
Text: dark

Buttons:

rounded-lg
padding medium
hover effect
transition

Cards:

rounded-xl
shadow-md
padding

Inputs:

border
rounded-md
focus ring

Layout:

centered content
max width container
responsive
mobile friendly

Use simple layout.
Do not use complicated UI.
Do not use heavy animations.
Keep UI easy to understand.

Use reusable UI components.

Do not use inline styles.
Use Tailwind classes only.

---------------------------------

# ================================
# SUPABASE CONNECTION
# ================================

Project URL:
https://khhocjqacftwptflwfak.supabase.co

Anon Key:
sb_publishable_5coidWsv8Oko-pxZJWXRSg_PIkTGlt9

Use Supabase JS client.

Example:

import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  "https://khhocjqacftwptflwfak.supabase.co",
  "sb_publishable_5coidWsv8Oko-pxZJWXRSg_PIkTGlt9"
);

---------------------------------

# ================================
# DATABASE SCHEMA
# ================================

Tables:

profiles
availability
courses
groups
group_members
matches
messages
notifications
roles
study_requests
user_courses

---------------------------------

## profiles
id
user_id
name
university
education_level
study_level
major
field_of_study
preferred_study_style
preferred_language
timezone
country
gender
bio
profile_picture_url

## availability
id
user_id
day
start_time
end_time

## courses
id
name
code

## groups
id
name
course_id
created_by

## group_members
id
group_id
user_id
role

## matches
id
user1_id
user2_id
score

## messages
id
sender_id
receiver_id
content
created_at

## notifications
id
user_id
title
body
is_read

## roles
id
user_id
role

## study_requests
id
sender_id
receiver_id
status
title
description
required_role
optional_availability

## user_courses
id
user_id
course_id

---------------------------------

# ================================
# RELATIONS
# ================================

user_courses.course_id → courses.id
groups.course_id → courses.id
group_members.group_id → groups.id

users referenced by user_id fields

---------------------------------

# ================================
# RLS RULES
# ================================

Users can only access their own data.

auth.uid() = user_id

Messages:
sender_id OR receiver_id must equal auth.uid()

Requests:
sender_id OR receiver_id must equal auth.uid()

Notifications:
user_id must equal auth.uid()

Admins:
roles.role = 'admin'
admins can access all tables

---------------------------------

# ================================
# FEATURES
# ================================

Auth
Profile
Matching
Messages
Study Requests
Groups
Courses
Availability
Notifications
Admin panel

---------------------------------

# ================================
# PAGES
# ================================

/login
/signup
/dashboard
/profile
/match
/messages
/requests
/groups
/courses
/availability
/notifications
/admin

---------------------------------

# ================================
# COMPONENT RULES
# ================================

Each page must have its own folder.

Use components folder.

components/
pages/
hooks/
lib/
services/

Use supabase client in /lib/supabase.ts

Do not duplicate code.

Use reusable UI components.

Keep components simple.

Do not use complex patterns.

---------------------------------

# ================================
# QUERY RULES
# ================================

Use Supabase client only.

Example:

supabase.from("profiles").select("*")

Messages:

supabase
.from("messages")
.select("*")
.or(
  `sender_id.eq.${userId},receiver_id.eq.${userId}`
)

Requests:

supabase
.from("study_requests")
.select("*")
.or(
  `sender_id.eq.${userId},receiver_id.eq.${userId}`
)

---------------------------------

# ================================
# MATCHING RULE
# ================================

Match users by:

same courses
same availability
same university

Use matches table.

---------------------------------

# ================================
# ADMIN RULES
# ================================

Admins stored in roles table.

role = admin

Admins can:

view all users
delete users
delete messages
manage groups
manage courses

---------------------------------

# ================================
# CURSOR RULES
# ================================

Always read this file before coding.

Follow database schema exactly.

Do not invent new tables.

Do not invent new columns.

Use existing relations.

Use Supabase queries only.

Use React + Tailwind.

Write simple code.

Use beginner style.

Use clear names.

Avoid advanced tricks.

Do not bypass RLS.

---------------------------------

# END
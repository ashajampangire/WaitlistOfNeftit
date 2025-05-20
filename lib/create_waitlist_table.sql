-- Create the waitlist table
create or replace function create_waitlist_table()
returns void
language plpgsql
as $$
begin
  create table if not exists waitlist (
    id uuid default uuid_generate_v4() primary key,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    email text unique not null,
    twitter_username text,
    discord_username text,
    referral_code text unique not null,
    referral_count integer default 0,
    referred_by text references waitlist(referral_code),
    status text default 'pending'
  );
end;
$$;

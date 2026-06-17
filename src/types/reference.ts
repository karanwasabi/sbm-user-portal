export type Country = {
  iso_code: string;
  name: string;
  default_timezone_id: string | null;
};

export type CountryCity = {
  id: number;
  country_code: string;
  name: string;
  popular_rank: number;
  timezone_id: string | null;
  state_code: string | null;
};

export type CountryState = {
  id: number;
  country_code: string;
  state_code: string | null;
  name: string;
  popular_rank: number;
  timezone_id: string | null;
};

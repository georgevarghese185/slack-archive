export type Member = {
  id: string;
  name: string;
  json: {
    profile: {
      display_name: string;
      image_24: string;
      image_32: string;
      image_48: string;
      image_72: string;
      image_192: string;
      image_512: string;
      image_1024: string;
      [key: string]: unknown;
    };
    [key: string]: unknown;
  };
};

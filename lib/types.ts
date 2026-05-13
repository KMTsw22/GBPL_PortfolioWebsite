export type LinkKind = 'link' | 'file';

export type LinkItem = {
  label: string;
  url: string;
  kind: LinkKind;
  pinned?: boolean;
};

export type Member = {
  id: string;
  email: string;
  name: string;
  role: string | null;
  bio: string | null;
  avatar_url: string | null;
  links: LinkItem[];
  tags: string[] | null;
  updated_at: string;
};

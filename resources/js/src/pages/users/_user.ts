export interface User {
    id: number;
    name: string;
    email: string;
    email_verified_at: string | null;
    password: string;
    remember_token: string | null;
    phone: string;
    gender: string | null;
    dob: string | null;
    avatar: string | null;
    is_2fa_enabled: boolean;
    created_at: string;
    updated_at: string;
}

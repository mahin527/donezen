const p = process.env;
if (!p.MONGODB_URI) {
    throw new Error("mongodb uri is not defined in env");
}

if (!p.JWT_SECRET) {
    throw new Error("jwt secret is not defined in env");
}

// TODO: Error habdling for all env values

export const conf = {
    db_url: p.MONGODB_URI,
    jwt_secret: p.JWT_SECRET,
    google_client_id: p.GOOGLE_CLIENT_ID,
    google_client_secret: p.GOOGLE_CLIENT_SECRET,
    google_refresh_token: p.GOOGLE_REFRESH_TOKEN,
    google_access_token: p.GOOGLE_ACCESS_TOKEN,
    google_user: p.GOOGLE_USER,
};

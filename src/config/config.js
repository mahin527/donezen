const p = process.env;
if (!p.MONGODB_URI) {
    throw new Error("mongodb uri is not defined in env");
}

if (!p.JWT_SECRET) {
    throw new Error("jwt secret is not defined in env");
}

export const conf = {
    db_url: p.MONGODB_URI,
    jwt_secret: p.JWT_SECRET,
};

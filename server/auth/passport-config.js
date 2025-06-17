import { Strategy as LocalStrategy } from "passport-local"; // Import LocalStrategy from passport-local

import fs from "fs";

export const getUsers = () => {
  try {
    const data = fs.readFileSync("users.json", "utf-8");
    return JSON.parse(data);
  } catch (err) {
    console.error("Failed to read users.json:", err);
    return [];
  }
};

function initialize(passport) {
  const authenticateUser = (username, password, done) => {
    const users = getUsers();
    const user = users.find(
      (u) => u.username === username && u.password === password
    );
    if (!user) return done(null, false, { message: "Incorrect credentials" });
    return done(null, user);
  };

  passport.use(new LocalStrategy(authenticateUser));

  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser((id, done) => {
    const users = getUsers();
    const user = users.find((u) => u.id === id);
    console.log("DESERIALIZE:", {
      idFromSession: id,
      userFound: user?.username,
    });
    done(null, user);
  });
}

export default initialize;

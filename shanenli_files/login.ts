import { Router } from "express";
import generateuserToken from "../utils/generateUserToken";
import { supabase } from "../utils/supabaseClient";
import axios from "axios";
const router = Router();

router.post("/", async (req, res) => {
  console.log("login");

  try {
    const { googleAccessToken } = req.body;
    console.log("googleAccessToken_server", googleAccessToken);
    // Verify the access token and get user info
    const googleResponse = await axios.get(
      `https://www.googleapis.com/oauth2/v1/userinfo?access_token=${googleAccessToken}`
    );

    const { email, name, picture } = googleResponse.data;
    console.log(email, name);

    let { data, error } = await supabase
      .from("Users") // Your table name
      .select("*")
      .eq("email", email)
      .single();

    // Handle the case where no rows are found
    if (error && error.code === "PGRST116") {
      console.log("User not found, creating new user...");
      const insertResponse = await supabase
        .from("Users")
        .insert([{ email, name }])
        .select("id, email, name");
      // .single(); // Assuming you want to automatically handle only one insert at a time
      console.log({ insertResponse });
      const { data: newUser, error: insertError } = insertResponse;
      if (insertError) {
        console.log("Error inserting new user: ", insertError.message);
        throw new Error(insertError.message);
      }
      console.log("New user created: ", newUser);

      data = newUser[0];
      console.log("data", data); // Assign the newly created user data for further processing
    } else if (error) {
      console.log("Error fetching user: ", error.message);
      throw new Error(error.message);
    }

    if (!data) {
      console.log("No user data available after insert.");
      return res
        .status(500)
        .json({ message: "User was not properly created or retrieved." });
    }

    const _id = data.id;
    const propsForToken = { email, name, _id };
    const token = generateuserToken(propsForToken);

    console.log({ token });
    res.status(200).json({
      message: "Login Success",
      token: token,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;

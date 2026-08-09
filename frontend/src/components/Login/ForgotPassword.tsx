exports.forgotPassword = async (req, res, next) => {
  try {
    console.log("1 - forgotPassword started");

    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    console.log("2 - searching user");

    const user = await Users.findByUsernameOrEmail({
      username: "",
      email,
    });

    console.log("3 - user search finished", !!user);

    if (!user) {
      return res.status(200).json({
        message: "If your email is registered, you will receive a reset link",
      });
    }

    console.log("4 - deleting old tokens");

    await PasswordReset.deleteByEmail(email);

    console.log("5 - old tokens deleted");

    const resetToken = jwt.sign(
      { email: user.email, user_id: user.id },
      configs.auth.resetPassTokenSecretKey,
      { expiresIn: "1h" },
    );

    console.log("6 - jwt created");

    const hashedToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

    console.log("7 - saving reset token");

    await PasswordReset.create(email, hashedToken, expiresAt);

    console.log("8 - reset token saved");

    const resetLink =
      `${process.env.FRONTEND_URL}/reset-password` +
      `?token=${resetToken}&email=${encodeURIComponent(email)}`;

    console.log("9 - sending email");

    await emailService.sendPasswordResetEmail(email, resetLink, user.name);

    console.log("10 - email sent");

    return res.status(200).json({
      message: "Password reset link sent to your email",
    });
  } catch (err) {
    console.error("FORGOT PASSWORD ERROR:", err);
    next(err);
  }
};

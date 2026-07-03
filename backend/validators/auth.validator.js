const yup = require("yup");

exports.registerValidateSchema = yup.object({
  email: yup
    .string()
    .email("Please Enter A Valid Email____")
    .required("Email Is Required____"),
  username: yup
    .string()
    .max(20, "Username Must Be A Maximum Of 20 Letters____")
    .min(3, "Username Must Be A Minimum Of 3 Letters____")
    .required("Username Is Required____"),
  name: yup
    .string()
    .max(50, "Name Must Be A Maximum Of 50 Letters____")
    .min(3, "Name Must Be A Minimum Of 3 Letters____")
    .required("Name Is Required____"),
  password: yup
    .string()
    .min(8, "Password Must Be A Minimum Of 8 Letters____")
    .required("password Is Required____"),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref("password")], "Passwords must match____")
    .required(),
});

exports.loginValidateSchema = yup.object({
  username: yup.string().required("username Is Required"),
  password: yup
    .string()
    .min(8, "Password Must Be A Minimum Of 8 Letters")
    .required("password Is Required"),
});

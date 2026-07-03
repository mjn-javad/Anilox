import axios from "axios";

export default axios.create({
  baseURL: "/api/v1/brandPopular",
  headers: {
    Authorization:
      "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoxNSwicm9sZSI6InVzZXIiLCJpYXQiOjE3NzIxMzgyNzcsImV4cCI6MTc3MzQzNDI3N30.99tjUz1OSzk1uo5r-kyEBpDIxBzbzo6R1XaXMNgjaYk",
    x_refresh_token:
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoxNSwicm9sZSI6ImFkbWluIiwiaWF0IjoxNzcyMTk3MjEwLCJleHAiOjE3NzM0OTMyMTB9.Xqq-QEL15WPqYiOlk0xbKuLn5c6a6zcuV2HXbl6npwM",
  },
});

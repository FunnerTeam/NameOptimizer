import * as React from "react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { observer } from "mobx-react-lite";
import { useTranslation } from "react-i18next";
import { useGoogleLogin } from "@react-oauth/google";

import Link from "../components/core/link";
import LanguageToggle from "../components/core/language-toggle";
import SchoolRegisterFormModal from "../components/modals/SchoolRegisterFormModal";
import AppLogo from "../../assets/icons/iconShanenLi.svg";
import { Loader } from "@web/assets/SVGComponents/loader";
import { loginWithGoogle, validateToken } from "../../api/userService";

import { Button, Box, Typography, Tooltip } from "@mui/material";
import { styled } from "@mui/system";

// import Google from "@mui/icons-material/Google";
import Google from "../../assets/icons/google_icon.png";
import BrowserModal from "@web/app/components/modals/BrowserModal";
import BackgroundCircle from "@web/assets/SVGComponents/BackgroundCircle";

function Copyright(props: any) {
  const { t } = useTranslation();
  return (
    <Typography
      className="copyright"
      variant="body2"
      color="text.secondary"
      align="center"
      {...props}
    >
      {t("copyright")}
      <Link color="inherit" href="https://mui.com/">
        {t("appName")}
      </Link>{" "}
      {new Date().getFullYear()}
      {"."}
    </Typography>
  );
}

const Icon = styled("img")({
  width: "24px",
  height: "24px",
  marginRight: "8px",
  display: "flex",
});

const AuthPage = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [isLoading, setIsLoading] = useState(true);
  const [open, setOpen] = React.useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [browserMessage, setBrowserMessage] = useState("");

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleOpen = () => setOpenModal(true);
  const handleCloseModal = () => setOpenModal(false);

  const handleGoogleLoginSuccess = async (tokenResponse: {
    access_token: string;
  }) => {
    try {
      const response = await loginWithGoogle(tokenResponse.access_token);
      const token = response.token;
      localStorage.setItem("access_token", token);
      navigate("/home");
    } catch (error) {
      console.error("Login error:", error);
    }
  };

  const login = useGoogleLogin({
    onSuccess: handleGoogleLoginSuccess,
    onError: () => {
      console.log("Login Failed");
    },
  });

  useEffect(() => {
    const checkAuthentication = async () => {
      const token = localStorage.getItem("access_token");
      if (token) {
        try {
          await validateToken();
          navigate("/home", { replace: true });
        } catch (e) {
          console.log(`error in validate: ${e}`);
          localStorage.removeItem("access_token");
        }
      }
      setIsLoading(false);
    };

    checkAuthentication();
  }, [navigate]);

  // Browser detection logic
  useEffect(() => {
    if (!isLoading) {
      const userAgent = navigator.userAgent.toLowerCase();
      if (userAgent.includes("android")) {
        setBrowserMessage(t("androidMessage"));
        handleOpen();
      } else if (userAgent.includes("edg/")) {
        setBrowserMessage(t("edgeMessage"));
        handleOpen();
      }
    }
  }, [isLoading]);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (token) {
      validateToken()
        .then((res) => {
          console.log({ res });
          navigate("/home");
        })
        .catch((e: any) => {
          console.log(`error in validate: ${e}`);
          navigate("/");
        });
    }
  }, []);

  if (isLoading) {
    return (
      <Box
        className="loader-container"
        sx={{
          position: "fixed",
          top: 0,
          zIndex: 100,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          width: "100vw",
          backgroundColor: "rgba(245, 245, 245, 0.4)",
        }}
      >
        <Loader
          sx={{ fontSize: "80px", filter: "drop-shadow(0px 0px 4px gray)" }}
        />
      </Box>
    );
  }

  return (
    <div className="app-container">
      <BackgroundCircle />
      <div className="body auth-page">
        <div className="card">
          <div className="brand-container">
            <div className="lang-button">
              <LanguageToggle />
            </div>

            <img src={AppLogo} />
            <h3>{t("appName")}</h3>
            <p>{t("appDescription")}</p>
          </div>

          <Button
            variant="outlined"
            // {i18next.language === 'he' ? 'startIcon=' : 'endIcon'}
            startIcon={
              <Box component="span">
                <Icon src={Google} alt={t("googleIcon")} />
              </Box>
            }
            size="medium"
            className="button google"
            onClick={() => login()}
          >
            {t("loginWithGoogle")}
          </Button>
          <h5>
            {t("schoolRegistrationInfo")}
            <br />
            <Link onClick={handleClickOpen}>{t("clickHere")}</Link>
          </h5>
        </div>
        <Copyright />
      </div>

      <SchoolRegisterFormModal open={open} handleClose={handleClose} />
      {/* <BrowserModal
        open={openModal}
        handleClose={handleClose}
        browserMessage={browserMessage}
      /> */}
    </div>
  );
};

export default observer(AuthPage);

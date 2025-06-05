import * as ReactDOM from "react-dom/client";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { I18nextProvider } from "react-i18next";
import i18n from '@web/utils/i18n';
import App from "./app/app";
import "./styles/main.scss";
import DirectionProvider from "./app/components/core/direction-provider";

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);

root.render(
  <I18nextProvider i18n={i18n}>
    <GoogleOAuthProvider
      // "357640292992-44j7d3e08tomd2fgaq1leocufkuoati7.apps.googleusercontent.com"
      clientId="30490746817-pmfiogl6451tmi0hb312fgpiqlcumeeh.apps.googleusercontent.com"
      onScriptLoadError={() => console.log("e")}
    >
      <DirectionProvider>
        <App />
      </DirectionProvider>
    </GoogleOAuthProvider>
  </I18nextProvider>
);
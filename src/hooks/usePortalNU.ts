import { useState, useEffect } from "react";

import Credential from "@arcgis/core/identity/Credential";
import Error from "@arcgis/core/core/Error";
import esriId from "@arcgis/core/identity/IdentityManager";
import OAuthInfo from "@arcgis/core/identity/OAuthInfo";
import Portal from "@arcgis/core/portal/Portal";
import PortalUser from "@arcgis/core/portal/PortalUser";
import { oAuth } from "../config.json";

export const usePortalNU = () => {
  const [credential, setCredential] = useState<Credential | null>();
  const [portalUser, setPortalUser] = useState<PortalUser | null>();
  const [authenticated, setAuthenticated] = useState<boolean>(false);
  const [error, setError] = useState<unknown>();

  useEffect(() => {
    const authenticate = async () => {
      const oauthInfo = new OAuthInfo({
        portalUrl: oAuth.portalUrl,
        appId: oAuth.appId,
      });
      esriId.registerOAuthInfos([oauthInfo]);
      let credentialResponse: Credential | null;
      try {
        credentialResponse = await esriId.checkSignInStatus(
          oauthInfo.portalUrl + "/sharing"
        );
        const portal = new Portal();
        await portal.load();
        setPortalUser(portal.user);
        setCredential(credentialResponse);
      } catch (error) {
        if (error instanceof Error) {
          while (!authenticated) {
            try {
              credentialResponse = await esriId.getCredential(
                oauthInfo.portalUrl + "/sharing"
              );
              console.log("x", authenticated);
              setCredential(credentialResponse);
              const portal = new Portal();
              setPortalUser(portal.user);
              setAuthenticated(true);
            } catch (error) {
              console.log(error);
            }
          }
        } else {
          setError(error);
        }
      }
    };
    authenticate();
  }, [authenticated]);

  return { credential, portalUser, error };
};

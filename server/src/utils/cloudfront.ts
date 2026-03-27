import crypto from "node:crypto";

function toUrlSafeBase64(input: string) {
  return input.replace(/\+/g, "-").replace(/=/g, "_").replace(/\//g, "~");
}

export function createCloudFrontSignedCookies(params: {
  keyPairId: string;
  privateKeyPem: string;
  resourceUrl: string;
  expiresAtUnix: number;
}) {
  const policy = JSON.stringify({
    Statement: [
      {
        Resource: params.resourceUrl,
        Condition: {
          DateLessThan: {
            "AWS:EpochTime": params.expiresAtUnix,
          },
        },
      },
    ],
  });

  const signer = crypto.createSign("RSA-SHA1");
  signer.update(policy);
  const signature = signer.sign(params.privateKeyPem, "base64");

  return {
    "CloudFront-Policy": toUrlSafeBase64(Buffer.from(policy).toString("base64")),
    "CloudFront-Signature": toUrlSafeBase64(signature),
    "CloudFront-Key-Pair-Id": params.keyPairId,
  };
}

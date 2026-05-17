const LINKEDIN_VERSION = "202605";

function linkedInHeaders(accessToken) {
  return {
    Authorization: `Bearer ${accessToken}`,
    "Content-Type": "application/json",
    "LinkedIn-Version": LINKEDIN_VERSION,
    "X-Restli-Protocol-Version": "2.0.0"
  };
}

async function getProfile(accessToken) {
  const resp = await fetch("https://api.linkedin.com/v2/userinfo", {
    headers: linkedInHeaders(accessToken)
  });
  const json = await resp.json();
  if (!resp.ok) {
    throw new Error(json.message || "Failed to fetch userinfo");
  }
  return json;
}

async function fetchRecentPosts(accessToken, personId) {
  const postsUrl = new URL("https://api.linkedin.com/v2/posts");
  postsUrl.searchParams.set("q", "author");
  postsUrl.searchParams.set("author", `urn:li:person:${personId}`);
  postsUrl.searchParams.set("count", "5");

  const resp = await fetch(postsUrl.toString(), {
    headers: linkedInHeaders(accessToken)
  });
  const json = await resp.json();
  if (!resp.ok) {
    throw new Error(json.message || "Failed to fetch posts");
  }
  return json;
}

async function publishPost(accessToken, body) {
  const resp = await fetch("https://api.linkedin.com/v2/posts", {
    method: "POST",
    headers: linkedInHeaders(accessToken),
    body: JSON.stringify(body)
  });
  const text = await resp.text();
  let json = {};
  if (text) {
    try {
      json = JSON.parse(text);
    } catch (err) {
      json = { raw: text };
    }
  }
  if (!resp.ok) {
    const message = json.message || "Publish failed";
    throw new Error(message);
  }
  return {
    id: resp.headers.get("x-restli-id") || json.id || null
  };
}

async function registerImageUpload(accessToken, ownerUrn) {
  const body = {
    registerUploadRequest: {
      owner: ownerUrn,
      recipes: ["urn:li:digitalmediaRecipe:feedshare-image"],
      serviceRelationships: [
        {
          relationshipType: "OWNER",
          identifier: "urn:li:userGeneratedContent"
        }
      ]
    }
  };

  const resp = await fetch("https://api.linkedin.com/v2/assets?action=registerUpload", {
    method: "POST",
    headers: linkedInHeaders(accessToken),
    body: JSON.stringify(body)
  });
  const json = await resp.json();
  if (!resp.ok) {
    throw new Error(json.message || "Image upload registration failed");
  }

  const upload = json?.value?.uploadMechanism?.["com.linkedin.digitalmedia.uploading.MediaUploadHttpRequest"];
  if (!upload?.uploadUrl || !json?.value?.asset) {
    throw new Error("Upload URL missing");
  }

  return { uploadUrl: upload.uploadUrl, asset: json.value.asset };
}

async function uploadImage(uploadUrl, image) {
  const bytes = Buffer.from(image.dataBase64, "base64");
  const resp = await fetch(uploadUrl, {
    method: "PUT",
    headers: {
      "Content-Type": image.mimeType || "image/png"
    },
    body: bytes
  });

  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(`Image upload failed: ${text}`);
  }
}

module.exports = {
  getProfile,
  fetchRecentPosts,
  publishPost,
  registerImageUpload,
  uploadImage
};

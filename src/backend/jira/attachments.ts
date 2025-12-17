import api, { route } from "@forge/api";
import { Buffer } from "buffer";

export const deleteAttachment = async ({ attachmentId }: { attachmentId: string }): Promise<void> => {
  // Delete JIRA Attachment
  await api.asApp().requestJira(route`/rest/api/3/attachment/${attachmentId}`, {
    method: "DELETE",
  });
};

export const attachToIssue = async ({
  fileContent,
  workItemKey,
  fileName,
}: {
  fileContent: Uint8Array;
  workItemKey: string;
  fileName: string;
}) => {
  const boundary = "----ForgeFormBoundary" + Math.random().toString(16).slice(2);

  // 3. Construire le body multipart
  const bodyStart =
    `--${boundary}\r\n` +
    `Content-Disposition: form-data; name="file"; filename="${fileName}"\r\n` +
    `Content-Type: application/pdf\r\n\r\n`;

  const bodyEnd = `\r\n--${boundary}--\r\n`;

  // Transformer en Buffer (Forge accepte les Uint8Array)
  const body = new Uint8Array([...Buffer.from(bodyStart, "utf8"), ...fileContent, ...Buffer.from(bodyEnd, "utf8")]);

  // 4. Appeler l’API Jira
  const response = await api.asApp().requestJira(route`/rest/api/3/issue/${workItemKey}/attachments`, {
    method: "POST",
    headers: {
      "X-Atlassian-Token": "no-check",
      "Content-Type": `multipart/form-data; boundary=${boundary}`,
      Accept: "application/json",
    },
    body: body as any, // hack pour typer correctement
  });

  if (!response.ok) {
    throw new Error(`Failed to upload PDF: ${response.status} ${response.statusText}`);
  }

  return await response.json();
};

export const getAttachment = async (attachmentId: string): Promise<string> => {
  const response = await api.asApp().requestJira(route`/rest/api/3/attachment/content/${attachmentId}`, {
    method: "GET",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(
      "Failed to fetch attachment data with error: " + response.statusText + " : " + (await response.text())
    );
  }

  return await response.text();
};

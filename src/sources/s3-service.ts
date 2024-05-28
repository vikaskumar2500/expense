import dotenv from "dotenv";
import {
  S3Client,
  PutObjectCommand,
  PutObjectCommandInput,
  GetObjectCommand,
  GetObjectCommandInput,
  ListObjectsV2Command,
  ListObjectsCommand,
  ListObjectsCommandInput,
} from "@aws-sdk/client-s3";

dotenv.config();

export const s3PutService = async (params: PutObjectCommandInput) => {
  const client = new S3Client({
    region: "ap-south-1",
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY,
      secretAccessKey: process.env.AWS_SECRET_KEY,
    },
  });

  const command = new PutObjectCommand(params);

  try {
    return await client.send(command);
  } catch (e) {
    console.log(e.message);
    return e.message;
  }
};

export const s3GetService = async (params: ListObjectsCommandInput) => {
  const client = new S3Client({
    region: "ap-south-1",
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY,
      secretAccessKey: process.env.AWS_SECRET_KEY,
    },
  });

  try {
    const listCommand = new ListObjectsCommand(params);
    const res = await client.send(listCommand);
    if (!res?.Contents) return [];
    return res.Contents.map((data) => {
      return {
        url: `${process.env.AWS_S3_END_POINT}/${data.Key}`,
        date: data.Key.replace(".csv", "").split("/")[1].split("-")[1],
      };
    });
  } catch (e) {
    console.log(e.message);
  }
};

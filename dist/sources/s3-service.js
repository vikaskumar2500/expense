"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.s3GetService = exports.s3PutService = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const client_s3_1 = require("@aws-sdk/client-s3");
dotenv_1.default.config();
const s3PutService = (params) => __awaiter(void 0, void 0, void 0, function* () {
    const client = new client_s3_1.S3Client({
        region: "ap-south-1",
        credentials: {
            accessKeyId: process.env.AWS_ACCESS_KEY,
            secretAccessKey: process.env.AWS_SECRET_KEY,
        },
    });
    const command = new client_s3_1.PutObjectCommand(params);
    try {
        return yield client.send(command);
    }
    catch (e) {
        console.log(e.message);
        return e.message;
    }
});
exports.s3PutService = s3PutService;
const s3GetService = (params) => __awaiter(void 0, void 0, void 0, function* () {
    const client = new client_s3_1.S3Client({
        region: "ap-south-1",
        credentials: {
            accessKeyId: process.env.AWS_ACCESS_KEY,
            secretAccessKey: process.env.AWS_SECRET_KEY,
        },
    });
    try {
        const listCommand = new client_s3_1.ListObjectsCommand(params);
        const res = yield client.send(listCommand);
        if (!(res === null || res === void 0 ? void 0 : res.Contents))
            return [];
        return res.Contents.map((data) => {
            return {
                url: `${process.env.AWS_S3_END_POINT}/${data.Key}`,
                date: data.Key.replace(".csv", "").split("/")[1].split("-")[1],
            };
        });
    }
    catch (e) {
        console.log(e.message);
    }
});
exports.s3GetService = s3GetService;
//# sourceMappingURL=s3-service.js.map
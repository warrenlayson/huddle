import { promises as fs } from "fs";
import path from "path";
import type { NextApiHandler } from "next";

const handler: NextApiHandler = async (req, res) => {
  const jsonDir = path.join(process.cwd(), "src", "data");
  const contents = await fs.readFile(jsonDir + "/tree.json", "utf8");
  res.status(200).json(contents);
};

export default handler;

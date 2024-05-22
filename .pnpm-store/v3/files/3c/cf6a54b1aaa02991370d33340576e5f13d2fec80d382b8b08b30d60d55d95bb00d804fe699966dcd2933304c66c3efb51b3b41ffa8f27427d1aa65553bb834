import * as fs from 'node:fs';
const commentParser = await import('comment-parser');
export const getTsImportCommentConfig = async (tsRelativePath) => {
    const tsContent = await fs.promises.readFile(tsRelativePath, `utf-8`);
    const comments = commentParser.parse(tsContent);
    const commentConfig = comments
        .map((comment) => {
        const metadataTags = comment.tags.filter((tag) => {
            return tag.tag === `tsImport`;
        });
        const metadataJsons = metadataTags.map((metadataTag) => {
            return JSON.parse(metadataTag.description);
        });
        return metadataJsons;
    })
        .flat();
    return commentConfig[0];
};
export const getTsImportCommentConfigSync = (tsRelativePath) => {
    const tsContent = fs.readFileSync(tsRelativePath, `utf-8`);
    const comments = commentParser.parse(tsContent);
    const commentConfig = comments
        .map((comment) => {
        const metadataTags = comment.tags.filter((tag) => {
            return tag.tag === `tsImport`;
        });
        const metadataJsons = metadataTags.map((metadataTag) => {
            return JSON.parse(metadataTag.description);
        });
        return metadataJsons;
    })
        .flat();
    return commentConfig[0];
};
//# sourceMappingURL=get-ts-import-comment-config.js.map
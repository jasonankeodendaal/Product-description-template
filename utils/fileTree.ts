import { Photo, Video } from "../App";

export interface FileTreeNode {
    name: string;
    type: 'folder' | 'file';
    kind?: 'photo' | 'video' | 'text' | 'json'; // For files
    id?: string; // For photos/videos
    path: string; // Full path for reference
    children?: FileTreeNode[];
}

export const buildFileTree = (photos: Photo[], videos: Video[]): FileTreeNode => {
    const root: FileTreeNode = { name: 'Generated_Content', type: 'folder', path: 'Generated_Content', children: [] };

    const allItems = [
        ...photos.map(p => ({ ...p, itemType: 'photo' as const })),
        ...videos.map(v => ({ ...v, itemType: 'video' as const }))
    ];

    allItems.forEach(item => {
        if (!item.folder) return;
        const pathParts = item.folder.split('/').filter(p => p); // e.g., ['Generated_Content', 'Brand', 'SKU']
        
        let currentNode = root;

        // Ensure the path starts with 'Generated_Content', if not, prepend it
        if (pathParts[0] !== 'Generated_Content') {
            pathParts.unshift('Generated_Content');
        }

        // Traverse or create folder nodes
        pathParts.slice(1).forEach((part, index) => { // slice(1) to skip root 'Generated_Content'
            let childNode = currentNode.children?.find(child => child.name === part && child.type === 'folder');
            if (!childNode) {
                childNode = {
                    name: part,
                    type: 'folder',
                    path: pathParts.slice(0, index + 2).join('/'),
                    children: []
                };
                currentNode.children?.push(childNode);
            }
            currentNode = childNode;
        });
        
        // Add file node
        const ext = item.itemType === 'photo' ? item.imageMimeType.split('/')[1] || 'jpg' : item.videoMimeType.split('/')[1] || 'mp4';
        const fileName = `${item.id}.${ext}`;

        currentNode.children?.push({
            name: fileName,
            type: 'file',
            kind: item.itemType,
            id: item.id,
            path: `${item.folder}/${fileName}`
        });

        // Add associated metadata files if they don't exist
        const hasTxt = currentNode.children?.some(c => c.name === 'description.txt');
        if (!hasTxt) {
            currentNode.children?.push({ name: 'description.txt', type: 'file', kind: 'text', path: `${item.folder}/description.txt` });
        }
        const hasJson = currentNode.children?.some(c => c.name === 'details.json');
        if (!hasJson) {
             currentNode.children?.push({ name: 'details.json', type: 'file', kind: 'json', path: `${item.folder}/details.json` });
        }
    });

    return root;
};

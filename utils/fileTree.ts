import { Photo, Video } from "../App";

export interface FileTreeNode {
    name: string;
    type: 'directory' | 'file';
    kind?: 'photo' | 'video' | 'text' | 'json'; // For files
    id?: string; // For photos/videos
    date?: string; // Date modified
    path: string; // Full path for reference
    children?: FileTreeNode[];
}

export const buildFileTree = (photos: Photo[], videos: Video[]): FileTreeNode => {
    const root: FileTreeNode = { name: 'Generated_Content', type: 'directory', path: 'Generated_Content', children: [] };

    const allItems = [
        ...photos.map(p => ({ ...p, itemType: 'photo' as const })),
        ...videos.map(v => ({ ...v, itemType: 'video' as const }))
    ];

    const folderDates: Record<string, string> = {};

    allItems.forEach(item => {
        if (!item.folder) return;
        
        // Track the latest date for each folder to apply to virtual files
        if (!folderDates[item.folder] || new Date(item.date) > new Date(folderDates[item.folder])) {
            folderDates[item.folder] = item.date;
        }

        const pathParts = item.folder.split('/').filter(p => p); 
        
        let currentNode = root;

        // Ensure the virtual tree always starts under Generated_Content
        if (pathParts[0] !== 'Generated_Content') {
            pathParts.unshift('Generated_Content');
        }

        pathParts.slice(1).forEach((part, index) => {
            let childNode = currentNode.children?.find(child => child.name === part && child.type === 'directory');
            if (!childNode) {
                childNode = {
                    name: part,
                    type: 'directory',
                    path: pathParts.slice(0, index + 2).join('/'),
                    children: []
                };
                currentNode.children?.push(childNode);
            }
            currentNode = childNode;
        });
        
        const ext = item.itemType === 'photo' ? item.imageMimeType.split('/')[1] || 'jpg' : item.videoMimeType.split('/')[1] || 'mp4';
        const fileName = `${item.id}.${ext}`;

        currentNode.children?.push({
            name: fileName,
            type: 'file',
            kind: item.itemType,
            id: item.id,
            date: item.date,
            path: `${item.folder}/${fileName}`
        });

        // Use the latest known date for virtual files in this folder
        const latestDateInFolder = folderDates[item.folder];

        // Add virtual files if they don't exist yet for this folder node
        const hasTxt = currentNode.children?.some(c => c.name === 'description.txt');
        if (!hasTxt) {
            currentNode.children?.push({ name: 'description.txt', type: 'file', kind: 'text', path: `${item.folder}/description.txt`, date: latestDateInFolder });
        }
        const hasJson = currentNode.children?.some(c => c.name === 'details.json');
        if (!hasJson) {
             currentNode.children?.push({ name: 'details.json', type: 'file', kind: 'json', path: `${item.folder}/details.json`, date: latestDateInFolder });
        }
    });

    return root;
};
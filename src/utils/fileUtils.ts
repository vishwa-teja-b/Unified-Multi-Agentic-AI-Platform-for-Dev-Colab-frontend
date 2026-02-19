import { FileSystemItem, Id } from "@/types/fileTypes";
import { v4 as uuidv4 } from "uuid";

/**
 * Create the initial file structure: a root directory with a default main.py file.
 */
export function initialFileStructure(): FileSystemItem {
    return {
        id: uuidv4(),
        name: "root",
        type: "directory",
        isOpen: true,
        children: [
            {
                id: uuidv4(),
                name: "main.py",
                type: "file",
                content: "# Start coding here\nprint('Hello, World!')\n",
            },
        ],
    };
}

/**
 * Recursively find a file/directory by its ID.
 */
export function getFileById(
    root: FileSystemItem,
    id: Id
): FileSystemItem | null {
    if (root.id === id) return root;
    if (root.children) {
        for (const child of root.children) {
            const found = getFileById(child, id);
            if (found) return found;
        }
    }
    return null;
}

/**
 * Find the parent directory of a given file/directory.
 */
export function findParentDirectory(
    root: FileSystemItem,
    targetId: Id
): FileSystemItem | null {
    if (root.children) {
        for (const child of root.children) {
            if (child.id === targetId) return root;
            const parent = findParentDirectory(child, targetId);
            if (parent) return parent;
        }
    }
    return null;
}

/**
 * Check if a file/dir name already exists in a directory.
 */
export function isNameExist(
    parentDir: FileSystemItem,
    name: string,
    excludeId?: Id
): boolean {
    if (!parentDir.children) return false;
    return parentDir.children.some(
        (child) => child.name === name && child.id !== excludeId
    );
}

/**
 * Sort file structure: directories first (alphabetical), then files (alphabetical).
 */
export function sortFileSystemItem(item: FileSystemItem): FileSystemItem {
    if (!item.children) return item;

    const sortedChildren = [...item.children]
        .sort((a, b) => {
            // Directories first
            if (a.type !== b.type) {
                return a.type === "directory" ? -1 : 1;
            }
            return a.name.localeCompare(b.name);
        })
        .map((child) => sortFileSystemItem(child));

    return { ...item, children: sortedChildren };
}

/**
 * Deep-clone a file structure, updating one item by its ID.
 */
export function updateItemInStructure(
    root: FileSystemItem,
    targetId: Id,
    updater: (item: FileSystemItem) => FileSystemItem
): FileSystemItem {
    if (root.id === targetId) return updater(root);
    if (!root.children) return root;

    return {
        ...root,
        children: root.children.map((child) =>
            updateItemInStructure(child, targetId, updater)
        ),
    };
}

/**
 * Deep-clone a file structure, removing one item by its ID.
 */
export function removeItemFromStructure(
    root: FileSystemItem,
    targetId: Id
): FileSystemItem {
    if (!root.children) return root;

    return {
        ...root,
        children: root.children
            .filter((child) => child.id !== targetId)
            .map((child) => removeItemFromStructure(child, targetId)),
    };
}

/**
 * Map from file extension to Monaco editor language ID.
 */
const EXTENSION_TO_LANGUAGE: Record<string, string> = {
    py: "python",
    js: "javascript",
    jsx: "javascript",
    ts: "typescript",
    tsx: "typescript",
    java: "java",
    cpp: "cpp",
    c: "c",
    h: "c",
    hpp: "cpp",
    go: "go",
    rs: "rust",
    php: "php",
    rb: "ruby",
    swift: "swift",
    kt: "kotlin",
    sql: "sql",
    html: "html",
    css: "css",
    json: "json",
    xml: "xml",
    yaml: "yaml",
    yml: "yaml",
    md: "markdown",
    sh: "shell",
    bash: "shell",
};

/**
 * Get Monaco language from a file name.
 */
export function getLanguageFromFileName(fileName: string): string {
    const ext = fileName.split(".").pop()?.toLowerCase() || "";
    return EXTENSION_TO_LANGUAGE[ext] || "plaintext";
}

/**
 * Map from Monaco language to Piston API language name.
 */
const PISTON_LANGUAGE_MAP: Record<string, string> = {
    python: "python",
    javascript: "node",
    typescript: "typescript",
    java: "java",
    cpp: "c++",
    c: "c",
    go: "go",
    rust: "rust",
    php: "php",
    ruby: "ruby",
    swift: "swift",
    kotlin: "kotlin",
    sql: "sql",
    shell: "bash",
};

/**
 * Get Piston language name from a Monaco language ID.
 */
export function getPistonLanguage(monacoLanguage: string): string {
    return PISTON_LANGUAGE_MAP[monacoLanguage] || monacoLanguage;
}

/**
 * Sanitize file structure: Move children of "files" to the root directory.
 * (Fixes bug where files were created inside other files)
 */
export function sanitizeFileSystem(root: FileSystemItem): FileSystemItem {
    const { node, extracted } = cleanNode(root);

    const finalRoot = { ...node };
    if (!finalRoot.children) finalRoot.children = [];
    finalRoot.children.push(...extracted);

    return finalRoot;
}

function cleanNode(node: FileSystemItem): { node: FileSystemItem, extracted: FileSystemItem[] } {
    if (!node.children || node.children.length === 0) {
        return { node: { ...node }, extracted: [] };
    }

    let myExtracted: FileSystemItem[] = [];
    const newChildren: FileSystemItem[] = [];

    for (const child of node.children) {
        const result = cleanNode(child);
        myExtracted.push(...result.extracted);
        newChildren.push(result.node);
    }

    const newerNode = { ...node, children: newChildren };

    if (node.type === 'file') {
        // I am a file, I cannot have children.
        // My children (newChildren) must be extracted.
        myExtracted.push(...newChildren);
        newerNode.children = [];
    }

    return { node: newerNode, extracted: myExtracted };
}

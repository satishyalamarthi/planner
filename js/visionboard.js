// Vision Board Manager

class VisionBoardManager {
    constructor() {
        this.images = [];
    }
    
    init() {
        this.loadImages();
    }
    
    loadImages() {
        this.images = storage.get(CONFIG.STORAGE_KEYS.VISION_BOARD) || [];
    }
    
    saveImages() {
        storage.set(CONFIG.STORAGE_KEYS.VISION_BOARD, this.images);
    }
    
    render() {
        const container = document.getElementById('view-vision-board');
        
        container.innerHTML = `
            <div class="vision-board-header">
                <h2 class="page-heading">
                    <i class="fas fa-sparkles"></i>
                    My Vision Board
                </h2>
                <button class="btn btn-primary" onclick="visionBoardManager.addImage()">
                    <i class="fas fa-plus"></i> Add Image
                </button>
            </div>
            
            <div class="vision-board-description">
                <p>✨ Create your dream board with inspiring images and goals ✨</p>
            </div>
            
            <div class="vision-board-grid">
                ${this.renderImages()}
            </div>
        `;
        
        this.addStyles();
    }
    
    renderImages() {
        if (this.images.length === 0) {
            return `
                <div class="empty-state">
                    <i class="fas fa-image"></i>
                    <h3>Your vision board is empty</h3>
                    <p>Start adding inspiring images to visualize your dreams!</p>
                </div>
            `;
        }
        
        return this.images.map((img, index) => `
            <div class="vision-card">
                <img src="${img.url}" alt="${escapeHtml(img.title)}" class="vision-image">
                <div class="vision-overlay">
                    <div class="vision-title">${escapeHtml(img.title)}</div>
                    <div class="vision-actions">
                        <button class="btn-icon" onclick="visionBoardManager.editImage(${index})">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn-icon" onclick="visionBoardManager.deleteImage(${index})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
    }
    
    addImage() {
        const modal = createModal({
            title: '✨ Add Vision Board Image',
            content: `
                <div class="form-group">
                    <label><i class="fas fa-heading"></i> Title</label>
                    <input type="text" id="visionTitle" placeholder="e.g., Dream House">
                </div>
                <div class="form-group">
                    <label><i class="fas fa-image"></i> Upload Image</label>
                    <input type="file" id="visionImage" accept="image/*">
                </div>
            `,
            confirmText: 'Add to Board',
            onConfirm: async () => {
                const title = document.getElementById('visionTitle').value.trim();
                const fileInput = document.getElementById('visionImage');
                
                if (!title || !fileInput.files[0]) {
                    showToast('Please provide title and image', 'error');
                    return false;
                }
                
                try {
                    const url = await handleImageUpload(fileInput.files[0]);
                    this.images.unshift({ title, url, createdAt: new Date().toISOString() });
                    this.saveImages();
                    this.render();
                    showToast('Image added to vision board! ✨', 'success');
                    return true;
                } catch (error) {
                    showToast('Error uploading image', 'error');
                    return false;
                }
            }
        });
        
        showModal(modal);
    }
    
    editImage(index) {
        const img = this.images[index];
        const modal = createModal({
            title: '✏️ Edit Image',
            content: `
                <div class="form-group">
                    <label>Title</label>
                    <input type="text" id="visionTitle" value="${escapeHtml(img.title)}">
                </div>
            `,
            onConfirm: () => {
                const title = document.getElementById('visionTitle').value.trim();
                if (!title) return false;
                
                img.title = title;
                this.saveImages();
                this.render();
                showToast('Image updated!', 'success');
                return true;
            }
        });
        
        showModal(modal);
    }
    
    deleteImage(index) {
        confirmDialog('Remove this image from your vision board?', () => {
            this.images.splice(index, 1);
            this.saveImages();
            this.render();
            showToast('Image removed', 'info');
        });
    }
    
    addStyles() {
        if (!document.getElementById('vision-board-styles')) {
            const style = document.createElement('style');
            style.id = 'vision-board-styles';
            style.textContent = `
                .vision-board-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 1.5rem;
                }
                
                .page-heading {
                    font-size: 2rem;
                    font-family: 'Caveat', cursive;
                    background: var(--gradient-primary);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                }
                
                .vision-board-description {
                    text-align: center;
                    margin-bottom: 2rem;
                    font-family: 'Patrick Hand', cursive;
                    font-size: 1.25rem;
                    color: var(--text-secondary);
                }
                
                .vision-board-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
                    gap: 1.5rem;
                }
                
                .vision-card {
                    position: relative;
                    aspect-ratio: 4/3;
                    border-radius: var(--radius-lg);
                    overflow: hidden;
                    box-shadow: var(--shadow-md);
                    transition: all var(--transition-normal);
                }
                
                .vision-card:hover {
                    transform: translateY(-5px);
                    box-shadow: var(--shadow-lg);
                }
                
                .vision-image {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }
                
                .vision-overlay {
                    position: absolute;
                    inset: 0;
                    background: linear-gradient(to top, rgba(0,0,0,0.8), transparent);
                    display: flex;
                    flex-direction: column;
                    justify-content: flex-end;
                    padding: 1.5rem;
                    opacity: 0;
                    transition: opacity var(--transition-fast);
                }
                
                .vision-card:hover .vision-overlay {
                    opacity: 1;
                }
                
                .vision-title {
                    font-size: 1.25rem;
                    font-weight: 600;
                    color: white;
                    margin-bottom: 0.75rem;
                }
                
                .vision-actions {
                    display: flex;
                    gap: 0.5rem;
                }
                
                @media (max-width: 768px) {
                    .vision-board-grid {
                        grid-template-columns: 1fr;
                    }
                    
                    .vision-overlay {
                        opacity: 1;
                    }
                }
            `;
            document.head.appendChild(style);
        }
    }
}

const visionBoardManager = new VisionBoardManager();

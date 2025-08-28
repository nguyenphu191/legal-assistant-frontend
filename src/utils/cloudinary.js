// src/utils/cloudinary.js - FIXED VERSION với cache busting
// Version với cache busting để fix lỗi avatar cũ

/**
 * Upload ảnh lên Cloudinary với cache busting
 * @param {File} file - File ảnh cần upload
 * @param {string} folder - Folder name (default: 'avatars')
 * @param {Object} options - Upload options
 * @returns {Promise<string>} - URL của ảnh đã upload với cache busting
 */
export const uploadToCloudinary = async (file, folder = 'avatars', options = {}) => {
  try {
    // Validate environment variables
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    if (!cloudName) {
      throw new Error('NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME không được cấu hình');
    }

    console.log('🚀 Starting Cloudinary upload:', {
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      folder,
      cloudName
    });

    // Tạo FormData để upload
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', 'user_avatars');
    
    // ✨ THÊM TIMESTAMP VÀO PUBLIC_ID ĐỂ FORCE CACHE BUST
    const timestamp = Date.now();
    if (options.public_id) {
      formData.append('public_id', `${options.public_id}_${timestamp}`);
    }
    
    // NOTE: Không thể dùng 'invalidate' với unsigned upload preset
    
    // Các parameters được phép cho unsigned upload
    if (options.tags) {
      formData.append('tags', options.tags);
    }
    
    if (options.context) {
      formData.append('context', JSON.stringify(options.context));
    }
    
    // Folder sẽ được set trong Upload Preset
    if (folder && folder !== 'avatars') {
      formData.append('folder', folder);
    }

    // Upload URL
    const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;
    
    console.log('📤 Uploading to:', uploadUrl);
    
    // Upload với timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    const response = await fetch(uploadUrl, {
      method: 'POST',
      body: formData,
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    console.log('📨 Upload response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Cloudinary upload error response:', errorText);
      
      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch (e) {
        throw new Error(`HTTP ${response.status}: ${errorText || 'Upload failed'}`);
      }
      
      throw new Error(errorData.error?.message || `HTTP ${response.status}: Upload failed`);
    }

    const data = await response.json();
    
    console.log('✅ Upload successful:', {
      url: data.secure_url,
      publicId: data.public_id,
      format: data.format,
      width: data.width,
      height: data.height,
      bytes: data.bytes,
      version: data.version
    });

    // ✨ RETURN URL WITH MULTIPLE CACHE BUSTING STRATEGIES
    const cacheBustUrl = `${data.secure_url}?v=${data.version}&t=${timestamp}&cb=${Date.now()}`;
    console.log('🔄 Cache bust URL:', cacheBustUrl);
    
    return cacheBustUrl;

  } catch (error) {
    console.error('❌ Error in uploadToCloudinary:', error);
    
    if (error.name === 'AbortError') {
      throw new Error('Upload timeout - Vui lòng thử lại');
    }
    
    if (error.message.includes('NetworkError')) {
      throw new Error('Lỗi kết nối mạng - Vui lòng kiểm tra internet');
    }
    
    throw error;
  }
};

/**
 * Validate file trước khi upload
 */
export const validateImageFile = (file, options = {}) => {
  const {
    maxSizeBytes = 10 * 1024 * 1024,
    allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
  } = options;

  if (!allowedTypes.includes(file.type)) {
    return {
      isValid: false,
      error: `Chỉ hỗ trợ các định dạng: ${allowedTypes.map(type => type.split('/')[1].toUpperCase()).join(', ')}`
    };
  }

  if (file.size > maxSizeBytes) {
    const maxSizeMB = Math.round(maxSizeBytes / (1024 * 1024));
    return {
      isValid: false,
      error: `Kích thước file không được vượt quá ${maxSizeMB}MB`
    };
  }

  if (file.size === 0) {
    return {
      isValid: false,
      error: 'File rỗng hoặc không hợp lệ'
    };
  }

  return { isValid: true, error: null };
};

/**
 * ✨ IMPROVED: Tạo URL với transformation và cache busting
 */
export const buildCloudinaryUrl = (url, transformations = {}) => {
  if (!url || !url.includes('cloudinary.com')) {
    return url;
  }

  try {
    // Parse URL để lấy các phần
    const parts = url.split('/upload/');
    if (parts.length !== 2) {
      return url;
    }

    // Tạo transformation string
    const transforms = [];
    
    if (transformations.width) transforms.push(`w_${transformations.width}`);
    if (transformations.height) transforms.push(`h_${transformations.height}`);
    if (transformations.crop) transforms.push(`c_${transformations.crop}`);
    if (transformations.quality) transforms.push(`q_${transformations.quality}`);
    if (transformations.format) transforms.push(`f_${transformations.format}`);
    if (transformations.gravity) transforms.push(`g_${transformations.gravity}`);
    
    // ✨ THÊM CACHE BUSTING PARAMETER VÀO TRANSFORMATION
    const cacheBust = `t_${Date.now()}`;
    transforms.push(cacheBust);

    const transformString = transforms.join(',');
    
    // Rebuild URL với transformations
    return `${parts[0]}/upload/${transformString}/${parts[1]}`;
  } catch (error) {
    console.error('❌ Error building Cloudinary URL:', error);
    return url;
  }
};

/**
 * ✨ NEW: Force refresh Cloudinary image để bypass cache
 */
export const forceRefreshCloudinaryUrl = (url) => {
  if (!url || !url.includes('cloudinary.com')) {
    return url;
  }
  
  const timestamp = Date.now();
  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}refresh=${timestamp}`;
};

/**
 * Extract public ID từ Cloudinary URL
 */
export const extractPublicId = (url) => {
  if (!url || !url.includes('cloudinary.com')) {
    return null;
  }

  try {
    const match = url.match(/\/upload\/(?:[^\/]+\/)*(?:v\d+\/)?(.+?)(?:\.[^.]+)?(?:\?.*)?$/);
    return match ? match[1] : null;
  } catch (error) {
    console.error('❌ Error extracting public ID:', error);
    return null;
  }
};

/**
 * Test kết nối đến Cloudinary
 */
export const testCloudinaryConnection = async () => {
  try {
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    if (!cloudName) {
      console.error('❌ NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME not configured');
      return false;
    }

    const testUrl = `https://res.cloudinary.com/${cloudName}/image/upload/sample.jpg`;
    const response = await fetch(testUrl, { method: 'HEAD' });
    
    console.log('🔗 Cloudinary connection test:', response.ok ? '✅ OK' : '❌ Failed');
    return response.ok;
  } catch (error) {
    console.error('❌ Cloudinary connection test failed:', error);
    return false;
  }
};
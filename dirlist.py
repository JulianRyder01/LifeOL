import os
import re

# ==========================================
# --- 用户配置区域 (USER CONFIGURATION) ---
# ==========================================

# 1. 起始目录 ("." 代表当前目录)
START_DIRECTORY = "."

# 2. 输出结果的文件名
OUTPUT_FILENAME = "directory_listing_with_content.txt"

# 3. 允许扫描的文件后缀 (白名单)
#    如果列表不为空 (例如 ['.py', '.txt'])，则只扫描这些文件。
#    如果列表为空 []，则扫描所有文件（除非被下方的排除列表排除）。
ALLOWED_EXTENSIONS = [] 

# 4. 排除的文件后缀 (黑名单) -- 新增功能 --
#    凡是这些后缀的文件，都不会被扫描。
#    常见排除项: 图片、音频、编译文件、压缩包等
EXCLUDED_EXTENSIONS = [
    '.png', '.jpg', '.jpeg', '.gif', '.bmp', '.svg', '.ico', # 图片
    '.mp3', '.mp4', '.avi', '.mov',                          # 音视频
    '.exe', '.dll', '.so', '.o', '.obj', '.class', '.pyc',   # 二进制/编译文件
    '.zip', '.tar', '.gz', '.7z', '.rar',                    # 压缩包
    '.pdf', '.doc', '.docx', '.xls', '.xlsx'                 # 文档
]

# 5. 要忽略的文件或文件夹全名 (精确匹配)
#    OUTPUT_FILENAME 会自动加入，防止递归读取自身
IGNORE_ITEMS = [
    '__pycache__', 
    '.gitignore', 
    '.git', 
    '.idea', 
    '.vscode', 
    'node_modules', 
    'dist', 
    'build', 
    'venv', 
    '.DS_Store',
    OUTPUT_FILENAME
]

# ==========================================
# --- 代码逻辑区域 (通常无需修改) ---
# ==========================================

def generate_tree_and_read_files(dir_path, output_file, prefix="", ignore_list=None, allowed_extensions=None, excluded_extensions=None):
    """
    递归地遍历目录，将目录结构和符合条件的文件内容写入输出文件。
    """
    if ignore_list is None: ignore_list = []
    if excluded_extensions is None: excluded_extensions = []

    try:
        # 1. 初步获取所有内容，并根据 ignore_list (精确匹配) 进行过滤
        #    例如: 排除 .git, node_modules 等文件夹或文件
        items = [item for item in os.listdir(dir_path) if item not in ignore_list]
    except PermissionError:
        output_file.write(f"{prefix}└── [权限不足，无法访问]\n")
        return

    # 2. 二次过滤：根据后缀名 (白名单 和 黑名单) 过滤文件
    filtered_items = []
    
    for item in items:
        path = os.path.join(dir_path, item)
        is_dir = os.path.isdir(path)
        is_file = os.path.isfile(path)
        
        # 始终保留目录，以便递归
        if is_dir:
            filtered_items.append(item)
            continue
            
        if is_file:
            # 逻辑 A: 检查是否在“排除后缀”列表中 (黑名单)
            if excluded_extensions and any(item.endswith(ext) for ext in excluded_extensions):
                continue # 跳过该文件

            # 逻辑 B: 检查是否在“允许后缀”列表中 (白名单)
            if allowed_extensions:
                # 如果指定了白名单，必须匹配才能保留
                if any(item.endswith(ext) for ext in allowed_extensions):
                    filtered_items.append(item)
            else:
                # 如果没指定白名单，且没被黑名单排除，则保留
                filtered_items.append(item)

    # 对过滤后的列表进行排序，保证输出顺序一致
    filtered_items.sort()
        
    pointers = ["├── "] * (len(filtered_items) - 1) + ["└── "]
    for pointer, item in zip(pointers, filtered_items):
        path = os.path.join(dir_path, item)

        # 写入目录或文件树状条目
        output_file.write(f"{prefix}{pointer}{item}\n")

        # 如果是目录，则进行递归
        if os.path.isdir(path):
            extension = "│   " if pointer == "├── " else "    "
            generate_tree_and_read_files(
                path, 
                output_file, 
                prefix + extension, 
                ignore_list, 
                allowed_extensions, 
                excluded_extensions
            )
        
        # 如果是文件，则读取并写入内容
        elif os.path.isfile(path):
            extension = "│   " if pointer == "├── " else "    "
            try:
                # 以只读和UTF-8编码打开文件，忽略解码错误
                with open(path, 'r', encoding='utf-8', errors='ignore') as f:
                    content = f.read()
                    
                    # 检查文件是否为空
                    if not content.strip():
                        output_file.write(f"{prefix}{extension}    (文件为空)\n")
                    else:
                        output_file.write(f"{prefix}{extension}┌─ [文件内容开始] ──────────\n")
                        for line in content.splitlines():
                            output_file.write(f"{prefix}{extension}│ {line}\n")
                        output_file.write(f"{prefix}{extension}└─ [文件内容结束] ──────────\n")
            except Exception as e:
                output_file.write(f"{prefix}{extension}[无法读取文件: {e}]\n")

def main():
    abs_start_directory = os.path.abspath(START_DIRECTORY)
    
    print("-" * 50)
    print(f"正在扫描目录: {abs_start_directory}")
    print("-" * 50)
    
    if ALLOWED_EXTENSIONS:
        print(f"模式: 白名单 (只扫描: {ALLOWED_EXTENSIONS})")
    else:
        print(f"模式: 扫描全部 (排除列表生效)")
        
    if EXCLUDED_EXTENSIONS:
        print(f"排除后缀: {EXCLUDED_EXTENSIONS}")
        
    print(f"忽略项目: {IGNORE_ITEMS}")
    print(f"输出文件: {OUTPUT_FILENAME}")
    print("-" * 50)
    
    try:
        with open(OUTPUT_FILENAME, 'w', encoding='utf-8') as f:
            f.write(f"目录扫描报告: {abs_start_directory}\n")
            if ALLOWED_EXTENSIONS:
                f.write(f"仅包含后缀: {ALLOWED_EXTENSIONS}\n")
            if EXCLUDED_EXTENSIONS:
                f.write(f"已排除后缀: {EXCLUDED_EXTENSIONS}\n")
            f.write("=" * 50 + "\n\n")
            
            generate_tree_and_read_files(
                abs_start_directory, 
                f, 
                ignore_list=IGNORE_ITEMS, 
                allowed_extensions=ALLOWED_EXTENSIONS,
                excluded_extensions=EXCLUDED_EXTENSIONS
            )
        print("\n扫描完成，文件已成功生成！")
    except Exception as e:
        print(f"\n在生成文件时发生错误: {e}")

if __name__ == "__main__":
    main()
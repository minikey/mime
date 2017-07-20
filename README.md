# mime
nodejs读取文件mimetype

获取图片文件的真实格式

>原理：读取文件头的特定字节，获取[文件指纹](https://en.wikipedia.org/wiki/List_of_file_signatures)(又称为魔法数)，来识别文件真正的类型

import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { User } from '@/models/User';
import { Resume } from '@/models/Resume';
import { ResumeVersion } from '@/models/ResumeVersion';

// GET: Fetch the current active resume and its details. Auto-seeds default data if empty.
export async function GET() {
  try {
    await dbConnect();

    // 1. Get or create a default user
    let user = await User.findOne({ email: 'demo@fitcv.ai' });
    if (!user) {
      user = await User.create({
        email: 'demo@fitcv.ai',
        name: 'Nguyễn Văn A',
        image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop',
      });
    }

    // 2. Get or create a default resume for the user
    let resume = await Resume.findOne({ userId: user._id });
    if (!resume) {
      resume = await Resume.create({
        userId: user._id,
        title: 'CV Bản Gốc - Frontend Developer',
      });
    }

    // 3. Get or create a default version
    let activeVersion = null;
    if (resume.activeVersionId) {
      activeVersion = await ResumeVersion.findById(resume.activeVersionId);
    }

    if (!activeVersion) {
      // Seed a rich developer resume version
      activeVersion = await ResumeVersion.create({
        resumeId: resume._id,
        versionNumber: 1,
        tags: {
          role: 'Senior Frontend Engineer',
          company: 'Original Template',
        },
        content: {
          personalInfo: {
            fullName: 'Nguyễn Văn A',
            title: 'Senior Frontend Engineer',
            email: 'nguyenvana@gmail.com',
            phone: '+84 901 234 567',
            website: 'https://nguyenvana.dev',
            github: 'github.com/nguyenvana',
            linkedin: 'linkedin.com/in/nguyenvana',
            location: 'Hồ Chí Minh, Việt Nam',
            summary: 'Kỹ sư Frontend với hơn 5 năm kinh nghiệm thiết kế và phát triển các ứng dụng web quy mô lớn sử dụng React/Next.js. Có thế mạnh về tối ưu hóa hiệu năng frontend, xây dựng hệ thống UI/UX tương tác mượt mà và phát triển kiến trúc Micro-Frontend.',
          },
          workExperience: [
            {
              id: 'exp-1',
              company: 'TechCorp JSC',
              position: 'Senior Frontend Engineer',
              location: 'Hồ Chí Minh, Việt Nam',
              startDate: '2022-03',
              endDate: 'Present',
              current: true,
              description: [
                'Trưởng nhóm frontend xây dựng nền tảng thương mại điện tử bằng Next.js, nâng tốc độ tải trang lên 40% và đạt điểm số Lighthouse SEO tối đa (99/100).',
                'Thiết kế và triển khai kiến trúc Micro-Frontend hỗ trợ 3 dự án nhánh chạy độc lập, tối ưu 50% tài nguyên server.',
                'Tích hợp và xây dựng thư viện UI dùng chung cho toàn công ty giúp rút ngắn 35% thời gian phát triển của các phòng ban.'
              ],
            },
            {
              id: 'exp-2',
              company: 'Innova Solutions',
              position: 'Frontend Developer',
              location: 'Hồ Chí Minh, Việt Nam',
              startDate: '2019-09',
              endDate: '2022-02',
              current: false,
              description: [
                'Phát triển và bảo trì hệ thống Dashboard phân tích dữ liệu thời gian thực sử dụng ReactJS, Redux Toolkit và TailwindCSS.',
                'Hợp tác chặt chẽ với đội ngũ UX/UI để chuyển hóa thiết kế Figma thành các component có khả năng tái sử dụng cao và responsive hoàn hảo.'
              ],
            }
          ],
          education: [
            {
              id: 'edu-1',
              school: 'Đại học Khoa học Tự nhiên',
              degree: 'Cử nhân Công nghệ Thông tin',
              fieldOfStudy: 'Khoa học Máy tính',
              location: 'Hồ Chí Minh, Việt Nam',
              startDate: '2015-09',
              endDate: '2019-06',
              description: 'Tốt nghiệp loại Giỏi. GPA: 3.6/4.0. Đề tài khóa luận nghiên cứu ứng dụng AI vào gợi ý lộ trình học tập.',
            }
          ],
          skills: [
            {
              id: 'skill-1',
              category: 'Ngôn ngữ lập trình',
              items: ['JavaScript', 'TypeScript', 'HTML5', 'CSS3', 'Python'],
            },
            {
              id: 'skill-2',
              category: 'Frameworks / Thư viện',
              items: ['React.js', 'Next.js (App Router)', 'Vue.js', 'TailwindCSS', 'Redux Toolkit', 'Node.js'],
            },
            {
              id: 'skill-3',
              category: 'Công cụ & Hệ điều hành',
              items: ['Git', 'Docker', 'Webpack', 'Vite', 'CI/CD (GitHub Actions)', 'Linux'],
            }
          ],
          projects: [
            {
              id: 'proj-1',
              name: 'FitCV.ai - AI Resume Optimizer',
              role: 'Lead Full-stack Developer',
              description: 'Ứng dụng tối ưu hóa CV theo Job Description dựa trên trí tuệ nhân tạo. Giúp ứng viên tự động căn chỉnh CV phù hợp với bộ lọc ATS tuyển dụng.',
              technologies: ['Next.js', 'TailwindCSS', 'Zustand', 'Mongoose', 'Gemini API'],
              url: 'https://github.com/nguyenvana/fit-cv-ai',
            }
          ],
          languages: [
            {
              id: 'lang-1',
              language: 'Tiếng Việt',
              proficiency: 'Bản xứ',
            },
            {
              id: 'lang-2',
              language: 'Tiếng Anh',
              proficiency: 'Thành thạo (IELTS 7.0)',
            }
          ],
          certifications: [
            {
              id: 'cert-1',
              name: 'AWS Certified Cloud Practitioner',
              issuer: 'Amazon Web Services',
              date: '2023-08',
            }
          ],
          layout: {
            template: 'two-columns-left',
            themeColor: 'emerald',
            fontFamily: 'sans',
            fontSize: 'md',
          },
        },
      });

      resume.activeVersionId = activeVersion._id as any;
      await resume.save();
    }

    return NextResponse.json({
      resume,
      activeVersion,
    });
  } catch (error: any) {
    const errorMsg = error.message || '';
    const isDbConnectionError = 
      error.name === 'MongooseServerSelectionError' ||
      error.name === 'MongoNetworkError' ||
      errorMsg.includes('ECONNREFUSED') ||
      errorMsg.includes('selection');

    if (isDbConnectionError) {
      console.warn('⚠️ Database connection failed. Returning empty resume for demo/offline mode.');
      return NextResponse.json({
        resume: null,
        activeVersion: null,
        error: 'Database connection failed'
      });
    }

    console.error('Error fetching resume:', error);
    return NextResponse.json({ error: errorMsg || 'Database error' }, { status: 500 });
  }
}

// POST: Save a new version of the resume.
export async function POST(req: Request) {
  try {
    await dbConnect();
    const { resumeId, content, tags } = await req.json();

    if (!resumeId || !content) {
      return NextResponse.json({ error: 'Missing resumeId or content' }, { status: 400 });
    }

    const resume = await Resume.findById(resumeId);
    if (!resume) {
      return NextResponse.json({ error: 'Resume not found' }, { status: 404 });
    }

    // Get the latest version number
    const versions = await ResumeVersion.find({ resumeId }).sort({ versionNumber: -1 }).limit(1);
    const nextVersionNumber = versions.length > 0 ? versions[0].versionNumber + 1 : 1;

    // Create a new version
    const newVersion = await ResumeVersion.create({
      resumeId,
      versionNumber: nextVersionNumber,
      content,
      tags: tags || { role: content.personalInfo?.title || 'Updated CV' },
    });

    // Update the resume to point to this new active version
    resume.activeVersionId = newVersion._id as any;
    resume.updatedAt = new Date();
    await resume.save();

    return NextResponse.json({
      message: 'Saved successfully',
      version: newVersion,
    });

  } catch (error: any) {
    console.error('Error saving resume version:', error);
    return NextResponse.json({ error: error.message || 'Database error' }, { status: 500 });
  }
}

const express = require('express');
const multer = require('multer');
const XLSX = require('xlsx');
const Student = require('../models/student');
const Upload = require('../models/upload');
const path = require('path');
const router = express.Router();
const upload = multer({ dest: 'uploads/' });

router.get('/uploads', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Upload successful! Data has been processed and saved to the database.',
    redirect: 'http://localhost:3001/analytics'
  });
});

router.post('/upload', upload.single('excel'), async (req, res) => {
  try {
    const { college } = req.body;
    
    if (!college) {
      return res.status(400).send('College name is required');
    }

    const workbook = XLSX.readFile(req.file.path);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = XLSX.utils.sheet_to_json(sheet, { defval: "" });

    if (data.length === 0) {
      return res.status(400).send('Excel file is empty');
    }

    const uploadRecord = new Upload({
      fileName: req.file.filename,
      originalName: req.file.originalname,
      college: college,
      recordCount: data.length,
      specializations: [...new Set(data.map(row => row["Specialization"]).filter(Boolean))]
    });
    
    await uploadRecord.save();

    for (let row of data) {
      const student = {
        name: row["Student Name"],
        age: row["Age"],
        gender: row["Gender"],
        specialization: row["Specialization"],
        uploadId: uploadRecord._id,
        semesters: []
      };

      const semesterMap = {};

      for (let key in row) {
        const match = key.match(/Sem(\d+)_Course(\d+)_(CT|Mid|Final)/);
        if (match) {
          const [_, semNum, courseNum, type] = match;
          const semKey = `Sem${semNum}`;
          const courseKey = `Course${courseNum}`;

          if (!semesterMap[semKey]) semesterMap[semKey] = {};
          if (!semesterMap[semKey][courseKey]) semesterMap[semKey][courseKey] = { name: courseKey, ct: 0, mid: 0, final: 0 };

          semesterMap[semKey][courseKey][type.toLowerCase()] = row[key];
        }
      }

      for (let sem in semesterMap) {
        student.semesters.push({
          semester: parseInt(sem.replace('Sem', '')),
          courses: Object.values(semesterMap[sem])
        });
      }

      await Student.create(student);
    }

    res.redirect('/uploads');
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).send('Error processing upload');
  }
});

router.post('/api/upload', upload.single('excel'), async (req, res) => {
  try {
    const { college } = req.body;
    
    if (!college) {
      return res.status(400).json({ error: 'College name is required' });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'Excel file is required' });
    }

    const workbook = XLSX.readFile(req.file.path);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = XLSX.utils.sheet_to_json(sheet, { defval: "" });

    if (data.length === 0) {
      return res.status(400).json({ error: 'Excel file is empty' });
    }

    const uploadRecord = new Upload({
      fileName: req.file.filename,
      originalName: req.file.originalname,
      college: college,
      recordCount: data.length,
      specializations: [...new Set(data.map(row => row["Specialization"]).filter(Boolean))]
    });
    
    await uploadRecord.save();

    for (let row of data) {
      const student = {
        name: row["Student Name"],
        age: row["Age"],
        gender: row["Gender"],
        specialization: row["Specialization"],
        uploadId: uploadRecord._id,
        semesters: []
      };

      const semesterMap = {};

      for (let key in row) {
        const match = key.match(/Sem(\d+)_Course(\d+)_(CT|Mid|Final)/);
        if (match) {
          const [_, semNum, courseNum, type] = match;
          const semKey = `Sem${semNum}`;
          const courseKey = `Course${courseNum}`;

          if (!semesterMap[semKey]) semesterMap[semKey] = {};
          if (!semesterMap[semKey][courseKey]) semesterMap[semKey][courseKey] = { name: courseKey, ct: 0, mid: 0, final: 0 };

          semesterMap[semKey][courseKey][type.toLowerCase()] = row[key];
        }
      }

      for (let sem in semesterMap) {
        student.semesters.push({
          semester: parseInt(sem.replace('Sem', '')),
          courses: Object.values(semesterMap[sem])
        });
      }

      await Student.create(student);
    }

    res.json({ 
      success: true, 
      message: 'File uploaded and processed successfully',
      uploadId: uploadRecord._id,
      recordCount: data.length
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Error processing upload' });
  }
});

router.get('/api/uploads', async (req, res) => {
  try {
    const uploads = await Upload.find({ isActive: true }).sort({ uploadDate: -1 });
    res.json(uploads);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching uploads' });
  }
});

router.get('/api/students', async (req, res) => {
  try {
    const { upload } = req.query;
    const filter = upload ? { uploadId: upload } : {};
    const students = await Student.find(filter);
    res.json(students);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching students' });
  }
});

router.get('/api/upload/:id', async (req, res) => {
  try {
    const upload = await Upload.findById(req.params.id);
    if (!upload) {
      return res.status(404).json({ error: 'Upload not found' });
    }
    res.json(upload);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching upload details' });
  }
});

router.get('/api/analytics/specializations', async (req, res) => {
  try {
    const { upload, gender } = req.query;
    const filter = {};
    
    if (upload && upload !== 'all') {
      filter.uploadId = upload;
    }
    
    if (gender && gender !== 'all') {
      filter.gender = new RegExp(gender, 'i');
    }

    const students = await Student.find(filter);
    
    const specializationStats = {};
    
    students.forEach(student => {
      if (!student.specialization) return;
      
      const spec = student.specialization;
      if (!specializationStats[spec]) {
        specializationStats[spec] = {
          totalStudents: 0,
          totalMarks: 0,
          totalMaxMarks: 0,
          courses: {},
          students: []
        };
      }
      
      specializationStats[spec].totalStudents++;
      
      let studentTotal = 0;
      let studentMax = 0;
      
      student.semesters.forEach(semester => {
        semester.courses.forEach(course => {
          const courseKey = `${course.name}_Sem${semester.semester}`;
          const totalMarks = (course.ct || 0) + (course.mid || 0) + (course.final || 0);
          const maxMarks = 100;
          
          studentTotal += totalMarks;
          studentMax += maxMarks;
          
          if (!specializationStats[spec].courses[courseKey]) {
            specializationStats[spec].courses[courseKey] = {
              courseName: course.name,
              semester: semester.semester,
              totalMarks: 0,
              maxMarks: 0,
              studentCount: 0,
              students: []
            };
          }
          
          specializationStats[spec].courses[courseKey].totalMarks += totalMarks;
          specializationStats[spec].courses[courseKey].maxMarks += maxMarks;
          specializationStats[spec].courses[courseKey].studentCount++;
          specializationStats[spec].courses[courseKey].students.push({
            name: student.name,
            marks: totalMarks,
            ct: course.ct || 0,
            mid: course.mid || 0,
            final: course.final || 0,
            percentage: (totalMarks / maxMarks) * 100
          });
        });
      });
      
      specializationStats[spec].totalMarks += studentTotal;
      specializationStats[spec].totalMaxMarks += studentMax;
      specializationStats[spec].students.push({
        id: student._id,
        name: student.name,
        age: student.age,
        gender: student.gender,
        totalMarks: studentTotal,
        maxMarks: studentMax,
        percentage: studentMax > 0 ? (studentTotal / studentMax) * 100 : 0,
        semesters: student.semesters
      });
    });
    
    const result = Object.keys(specializationStats).map(spec => {
      const stats = specializationStats[spec];
      const avgPercentage = stats.totalMaxMarks > 0 ? (stats.totalMarks / stats.totalMaxMarks) * 100 : 0;
      
      const courses = Object.keys(stats.courses).map(courseKey => {
        const course = stats.courses[courseKey];
        const courseAvg = course.maxMarks > 0 ? (course.totalMarks / course.maxMarks) * 100 : 0;
        
        return {
          ...course,
          averagePercentage: courseAvg,
          students: course.students.sort((a, b) => b.percentage - a.percentage)
        };
      }).sort((a, b) => b.averagePercentage - a.averagePercentage);
      
      return {
        specialization: spec,
        totalStudents: stats.totalStudents,
        averagePercentage: avgPercentage,
        courses: courses,
        students: stats.students.sort((a, b) => b.percentage - a.percentage)
      };
    }).sort((a, b) => b.averagePercentage - a.averagePercentage);
    
    res.json(result);
  } catch (error) {
    console.error('Error fetching specialization analytics:', error);
    res.status(500).json({ error: 'Error fetching analytics data' });
  }
});

router.get('/api/students/:id/details', async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }
    
    let totalMarks = 0;
    let totalMaxMarks = 0;
    const semesterStats = [];
    
    student.semesters.forEach(semester => {
      let semTotalMarks = 0;
      let semMaxMarks = 0;
      const courseStats = [];
      
      semester.courses.forEach(course => {
        const courseTotal = (course.ct || 0) + (course.mid || 0) + (course.final || 0);
        const courseMax = 300;
        
        semTotalMarks += courseTotal;
        semMaxMarks += courseMax;
        totalMarks += courseTotal;
        totalMaxMarks += courseMax;
        
        courseStats.push({
          name: course.name,
          ct: course.ct || 0,
          mid: course.mid || 0,
          final: course.final || 0,
          total: courseTotal,
          percentage: (courseTotal / courseMax) * 100
        });
      });
      
      semesterStats.push({
        semester: semester.semester,
        totalMarks: semTotalMarks,
        maxMarks: semMaxMarks,
        percentage: semMaxMarks > 0 ? (semTotalMarks / semMaxMarks) * 100 : 0,
        courses: courseStats.sort((a, b) => b.percentage - a.percentage)
      });
    });
    
    const overallPercentage = totalMaxMarks > 0 ? (totalMarks / totalMaxMarks) * 100 : 0;
    
    res.json({
      student: {
        id: student._id,
        name: student.name,
        age: student.age,
        gender: student.gender,
        specialization: student.specialization
      },
      statistics: {
        overallPercentage,
        totalMarks,
        totalMaxMarks,
        semesters: semesterStats.sort((a, b) => a.semester - b.semester)
      }
    });
  } catch (error) {
    console.error('Error fetching student details:', error);
    res.status(500).json({ error: 'Error fetching student details' });
  }
});

module.exports = router;

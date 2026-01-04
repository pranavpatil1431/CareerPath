// Test merit API endpoint
import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/careerpath";

const studentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  marks: { type: Number, required: true },
  stream: { type: String, default: '' },
  course: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now }
});

async function testMeritAPI() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to database');
    
    const Student = mongoose.model('Student', studentSchema);
    const allStudents = await Student.find().sort({ marks: -1 });
    
    // Group students by stream and sort by marks
    const meritByStream = {
      Science: [],
      Arts: [],
      Commerce: []
    };

    // Group students by their stream
    allStudents.forEach(student => {
      const stream = student.stream;
      if (meritByStream.hasOwnProperty(stream)) {
        meritByStream[stream].push({
          _id: student._id,
          name: student.name,
          email: student.email,
          marks: student.marks,
          preferredCourse: student.course,
          stream: stream,
          createdAt: student.createdAt
        });
      }
    });

    // Sort each stream by marks (highest first)
    Object.keys(meritByStream).forEach(stream => {
      meritByStream[stream] = meritByStream[stream]
        .sort((a, b) => b.marks - a.marks)
        .map((student, index) => ({
          ...student,
          rank: index + 1
        }));
    });

    console.log('Merit data:', {
      Science: meritByStream.Science.length,
      Arts: meritByStream.Arts.length,
      Commerce: meritByStream.Commerce.length
    });
    
    const apiResponse = {
      success: true,
      data: meritByStream
    };
    
    console.log('\n🎯 Merit API Response structure:');
    console.log('Success:', apiResponse.success);
    console.log('Data keys:', Object.keys(apiResponse.data));
    console.log('Science students:', apiResponse.data.Science.length);
    console.log('Arts students:', apiResponse.data.Arts.length);
    console.log('Commerce students:', apiResponse.data.Commerce.length);
    
    // Show first student from each stream
    console.log('\n🏆 Top students by stream:');
    if (apiResponse.data.Science.length > 0) {
      console.log(`Science #1: ${apiResponse.data.Science[0].name} (${apiResponse.data.Science[0].marks}%)`);
    }
    if (apiResponse.data.Arts.length > 0) {
      console.log(`Arts #1: ${apiResponse.data.Arts[0].name} (${apiResponse.data.Arts[0].marks}%)`);
    }
    if (apiResponse.data.Commerce.length > 0) {
      console.log(`Commerce #1: ${apiResponse.data.Commerce[0].name} (${apiResponse.data.Commerce[0].marks}%)`);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
}

testMeritAPI();
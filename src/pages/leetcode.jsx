import { useEffect, useState } from 'react';
import LeetcodeCalendar from '../components/LeetcodeCalendar';
import avatarImage from '../images/avatar.jpeg'
import Image from 'next/image'

export default function LeetCodeStats() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    async function fetchStats() {
      const response = await fetch('/api/leetcode');
      const data = await response.json();
      setStats(data);
    }
    fetchStats();
  }, []);

  if (!stats) {
    return <div className="text-center text-white">Loading...</div>;
  }

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      {/* Page Title */}
      <h1 className="text-3xl font-extrabold mb-6 text-center text-white">LeetCode Profile</h1>

      {/* User Profile Card */}
      <div className="bg-white bg-opacity-75 shadow-md rounded p-6 mb-6 flex flex-col sm:flex-row items-center sm:items-start sm:space-x-6">
        {/* Avatar (replace with your own avatar if desired) */}
        <div className="flex-shrink-0 mb-4 sm:mb-0">
          <div className="w-20 h-20 rounded-full bg-gray-300 flex items-center justify-center text-2xl text-white font-bold">
                  <Image
                      src={avatarImage}
                      alt="avatar"
                      className="rounded-full"
                      />
                  </div>
                </div>
                
                {/* Personal Info */}
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Suleyman</h2>
          <p className="text-gray-600">@kianis4</p>
          <p className="text-gray-700 font-semibold mt-2">Rank: 244,767</p>

                <div className="mt-4 space-y-1 text-gray-700">
                <p><strong>Location:</strong> Canada</p>
                <p><strong>University:</strong> McMaster University</p>
                <p><strong>
                  GitHub: 
                  </strong>
                  <a 
                  href="https://github.com/kianis4" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-blue-500 hover:underline"
                  >
                   kianis4
                  </a>
                </p>
                <p>
                  <strong>LinkedIn:</strong>{' '}
                  <a 
                  href="https://www.linkedin.com/in/suleyman-kiani/" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-blue-500 hover:underline"
                  >
                  suleyman-kiani
                  </a>
                </p>
                </div>
              </div>
              </div>
      {/* Combine Profile Information & LeetCode Profile Stats */}
      <div className="flex flex-col md:flex-row md:space-x-4">
        {/* Profile Information Card */}
        <div className="bg-white bg-opacity-75 shadow-md rounded p-4 mb-4 flex-1">
          <h2 className="text-xl font-semibold mb-2 text-gray-800">Profile Information</h2>
          <p className="text-gray-700">
            <strong>Ranking:</strong> {stats.ranking}
          </p>
          <p className="text-gray-700">
            <strong>Contribution Points:</strong> {stats.contributionPoint}
          </p>
          <p className="text-gray-700">
            <strong>Reputation:</strong> {stats.reputation}
          </p>
        </div>

        {/* LeetCode Profile Stats Card */}
        <div className="bg-white bg-opacity-75 shadow-md rounded p-4 mb-4 flex-1">
          <h2 className="text-xl font-semibold mb-2 text-gray-800">LeetCode Profile Stats</h2>
          <p className="text-gray-700">
            <strong>Total Solved:</strong> {stats.totalSolved} / {stats.totalQuestions}
          </p>
          <p className="text-gray-700">
            <strong>Easy:</strong> {stats.easySolved} / {stats.totalEasy}
          </p>
          <p className="text-gray-700">
            <strong>Medium:</strong> {stats.mediumSolved} / {stats.totalMedium}
          </p>
          <p className="text-gray-700">
            <strong>Hard:</strong> {stats.hardSolved} / {stats.totalHard}
          </p>
        </div>
      </div>
              {/* Activity Calendar */}
      <div className="mb-6 bg-white bg-opacity-75 shadow-md rounded p-4 text-center">
        <h2 className="text-xl font-semibold mb-2 text-gray-800">Activity Calendar</h2>
        <LeetcodeCalendar />
      </div>



      {/* Recent Submissions */}
      <div className="bg-white bg-opacity-75 shadow-md rounded p-4 mb-4">
        <h2 className="text-xl font-semibold mb-2 text-gray-800">Recent Submissions</h2>
        <ul className="list-disc list-inside text-gray-700">
          {stats.recentSubmissions.map((submission, index) => (
            <li key={index} className="mb-1">
              <strong>{new Date(submission.timestamp * 1000).toLocaleDateString()}:</strong>{' '}
              {submission.title} ({submission.statusDisplay})
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

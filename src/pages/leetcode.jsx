import { useEffect, useState } from 'react';
import LeetcodeCalendar from '../components/LeetcodeCalendar';

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
      <h1 className="text-2xl font-bold mb-4 text-center text-white">LeetCode Stats</h1>
      
      {/* Activity Calendar */}
      <div className="mb-6">
        <LeetcodeCalendar />
      </div>
      
      <div className="bg-white bg-opacity-75 shadow-md rounded p-4 mb-4">
        <h2 className="text-xl font-semibold mb-2 text-gray-800">Profile Information</h2>
        <p className="text-gray-700"><strong>Ranking:</strong> {stats.ranking}</p>
        <p className="text-gray-700"><strong>Contribution Points:</strong> {stats.contributionPoint}</p>
        <p className="text-gray-700"><strong>Reputation:</strong> {stats.reputation}</p>
      </div>
      <div className="bg-white bg-opacity-75 shadow-md rounded p-4 mb-4">
        <h2 className="text-xl font-semibold mb-2 text-gray-800">LeetCode Profile Stats</h2>
        <p className="text-gray-700"><strong>Total Solved:</strong> {stats.totalSolved} / {stats.totalQuestions}</p>
        <p className="text-gray-700"><strong>Easy:</strong> {stats.easySolved} / {stats.totalEasy}</p>
        <p className="text-gray-700"><strong>Medium:</strong> {stats.mediumSolved} / {stats.totalMedium}</p>
        <p className="text-gray-700"><strong>Hard:</strong> {stats.hardSolved} / {stats.totalHard}</p>
      </div>
      <div className="bg-white bg-opacity-75 shadow-md rounded p-4 mb-4">
        <h2 className="text-xl font-semibold mb-2 text-gray-800">Recent Submissions</h2>
        <ul className="list-disc list-inside text-gray-700">
          {stats.recentSubmissions.map((submission, index) => (
            <li key={index} className="mb-1">
              <strong>{new Date(submission.timestamp * 1000).toLocaleDateString()}:</strong> {submission.title} ({submission.statusDisplay})
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}